import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from '@/lib/stripe.server';
import { reconcileSubscription } from '@/lib/payments.server';
import { paidAccess, paymentEnvironmentSchema, PREMIUM_PRICE_ID } from '@/lib/payment-rules';
const inputSchema = z.object({ environment: paymentEnvironmentSchema });
async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error('Invalid userId');
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({ ...(options.email && { email: options.email }), ...(options.userId && { metadata: { userId: options.userId } }) });
  return created.id;
}
export const getBilling = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth])
  .inputValidator(input => inputSchema.parse(input)).handler(async ({ data, context }) => {
    const result = await context.supabase.from('payment_subscriptions').select('*').eq('user_id', context.userId)
      .eq('environment', data.environment).order('updated_at', { ascending: false });
    if (result.error) throw new Error('Your subscription could not be loaded.');
    const active = result.data?.find(row => paidAccess(row.status, row.current_period_end));
    return { subscription: active ?? result.data?.[0] ?? null, active: !!active };
  });
export const createCheckoutSession = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => inputSchema.parse(input)).handler(async ({ data, context }): Promise<{ clientSecret: string } | { error: string }> => {
    try {
      const profile = await context.supabase.from('profiles').select('id').eq('id', context.userId).maybeSingle();
      if (profile.error || !profile.data) throw new Error('Save your adult profile before subscribing.');
      const stripe = createStripeClient(data.environment);
      const auth = await context.supabase.auth.getUser();
      const customer = await resolveOrCreateCustomer(stripe, { userId: context.userId, email: auth.data.user?.email });
      const subscriptions = await stripe.subscriptions.list({ customer, status: 'all', limit: 100 });
      if (subscriptions.data.some(sub => ['active', 'trialing', 'past_due', 'incomplete', 'unpaid', 'paused'].includes(sub.status))) throw new Error('You already have a subscription. Manage it instead of purchasing again.');
      const prices = await stripe.prices.list({ lookup_keys: [PREMIUM_PRICE_ID], active: true });
      const price = prices.data[0];
      if (!price || price.currency !== 'gbp' || price.unit_amount !== 799 || price.recurring?.interval !== 'month') throw new Error('The £7.99 monthly Premium price is unavailable.');
      if (price.tax_behavior === 'unspecified') await stripe.prices.update(price.id, { tax_behavior: 'inclusive' });
      if (price.tax_behavior === 'exclusive') throw new Error('Premium needs a tax-inclusive price before checkout can open.');
      // Reuse an open session and serialize creation through a time-window idempotency key.
      const sessions = await stripe.checkout.sessions.list({ customer, status: 'open', limit: 10 });
      const existing = sessions.data.find(session => session.metadata?.userId === context.userId && session.client_secret && session.mode === 'subscription');
      if (existing?.client_secret) return { clientSecret: existing.client_secret };
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page', mode: 'subscription', customer,
        line_items: [{ price: price.id, quantity: 1 }],
        automatic_tax: { enabled: true },
        return_url: `${new URL(getRequest().url).origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
        metadata: { userId: context.userId }, subscription_data: { metadata: { userId: context.userId } },
      }, { idempotencyKey: `premium-${data.environment}-${context.userId}-${Math.floor(Date.now() / 600000)}` });
      if (!session.client_secret) throw new Error('Stripe did not return a checkout form.');
      return { clientSecret: session.client_secret };
    } catch (error) { return { error: getStripeErrorMessage(error) }; }
  });
export const confirmCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => inputSchema.extend({ sessionId: z.string().regex(/^cs_[a-zA-Z0-9_]+$/).max(250) }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      const session = await createStripeClient(data.environment).checkout.sessions.retrieve(data.sessionId);
      if (session.metadata?.userId !== context.userId) throw new Error('This payment does not belong to your account.');
      if (session.status !== 'complete' || session.payment_status === 'unpaid') return { pending: true };
      const id = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (!id) throw new Error('No subscription was found for this payment.');
      await reconcileSubscription(id, data.environment, context.userId);
      return { pending: false };
    } catch (error) { return { error: getStripeErrorMessage(error) }; }
  });
export const createPortalSession = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => inputSchema.parse(input)).handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    try {
      const rows = await context.supabase.from('payment_subscriptions').select('provider_customer_id').eq('user_id', context.userId).eq('environment', data.environment).order('updated_at', { ascending: false }).limit(1).maybeSingle();
      if (rows.error || !rows.data) throw new Error('No subscription found.');
      const portal = await createStripeClient(data.environment).billingPortal.sessions.create({ customer: rows.data.provider_customer_id, return_url: `${new URL(getRequest().url).origin}/premium` });
      return { url: portal.url };
    } catch (error) { return { error: getStripeErrorMessage(error) }; }
  });