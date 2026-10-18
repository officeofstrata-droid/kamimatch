import { createFileRoute } from '@tanstack/react-router';
import { verifyWebhook } from '@/lib/stripe.server';
import { reconcileSubscription } from '@/lib/payments.server';
export const Route = createFileRoute('/api/public/payments/webhook')({ staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const environment = new URL(request.url).searchParams.get('env');
    if (environment !== 'sandbox' && environment !== 'live') return new Response('Invalid environment', { status: 400 });
    let event;
    try { event = await verifyWebhook(request, environment); }
    catch { return new Response('Invalid webhook signature', { status: 400 }); }
    try {
      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        await reconcileSubscription(event.data.object.id, environment, undefined, event.created);
      } else if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object;
        if (session.payment_status !== 'unpaid') {
          const id = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
          if (id) await reconcileSubscription(id, environment, undefined, event.created);
        }
      } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
        const subscription = event.data.object.parent?.subscription_details?.subscription;
        const id = typeof subscription === 'string' ? subscription : subscription?.id;
        if (id) await reconcileSubscription(id, environment, undefined, event.created);
      }
      return Response.json({ received: true });
    } catch { return new Response('Payment update could not be saved', { status: 500 }); }
  } } },
});