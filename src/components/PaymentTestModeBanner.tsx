export function PaymentTestModeBanner() {
  const token = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
  if (!token || (!token.startsWith('pk_test_') && !token.startsWith('pk_live_'))) return <p role="status" className="border-b border-destructive bg-secondary px-4 py-3 text-center text-sm text-destructive">Real payments are not configured. Complete Stripe go-live in Lovable.</p>;
  if (token.startsWith('pk_test_')) return <p role="status" className="border-b border-border bg-secondary px-4 py-3 text-center text-sm text-foreground">Test payments only. No real money is charged. Test subscriptions never grant live Premium access.</p>;
  return null;
}