import { loadStripe, type Stripe } from '@stripe/stripe-js';
const clientToken = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
type StripeEnv = 'sandbox' | 'live';
export function getStripeEnvironment(): StripeEnv {
  if (clientToken?.startsWith('pk_test_')) return 'sandbox';
  if (clientToken?.startsWith('pk_live_')) return 'live';
  throw new Error('Payments are not configured. Complete Stripe go-live in Lovable to accept real payments.');
}
let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe() {
  getStripeEnvironment();
  if (!stripePromise && clientToken) stripePromise = loadStripe(clientToken);
  return stripePromise;
}