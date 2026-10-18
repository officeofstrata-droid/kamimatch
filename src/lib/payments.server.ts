import type Stripe from 'stripe';
import { createStripeClient, type StripeEnv } from '@/lib/stripe.server';
import { PREMIUM_PRICE_ID } from '@/lib/payment-rules';
import { z } from 'zod';
export async function syncSubscription(subscription: Stripe.Subscription, environment: StripeEnv, eventCreated: number) {
  const userId = z.string().uuid().parse(subscription.metadata.userId);
  const item = subscription.items.data[0];
  if (!item || (item.price.lookup_key ?? item.price.metadata.lovable_external_id) !== PREMIUM_PRICE_ID) return;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const result = await supabaseAdmin.rpc('sync_payment_subscription', {
    _id: subscription.id, _user: userId, _env: environment, _customer: customerId,
    _price: PREMIUM_PRICE_ID, _status: subscription.status,
    _end: new Date(item.current_period_end * 1000).toISOString(), _cancel: subscription.cancel_at_period_end,
    _event_created: eventCreated,
  });
  if (result.error) throw new Error('Subscription update could not be saved.');
}
export async function reconcileSubscription(id: string, environment: StripeEnv, userId?: string, eventCreated = Math.floor(Date.now() / 1000)) {
  const subscription = await createStripeClient(environment).subscriptions.retrieve(id);
  if (userId && subscription.metadata.userId !== userId) throw new Error('This subscription does not belong to your account.');
  await syncSubscription(subscription, environment, eventCreated);
  return subscription;
}