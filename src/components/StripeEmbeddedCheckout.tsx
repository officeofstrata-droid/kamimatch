import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
export function StripeEmbeddedCheckout({ clientSecret }: { clientSecret: string }) {
  return <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}><EmbeddedCheckout /></EmbeddedCheckoutProvider>;
}