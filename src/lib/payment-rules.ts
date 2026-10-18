import { z } from 'zod';
export const PREMIUM_PRICE_ID = 'waifumatch_premium_monthly';
export const paymentEnvironmentSchema = z.enum(['sandbox', 'live']);
export function paidAccess(status: string, end: string | null, now = Date.now()) {
  return ['active', 'trialing', 'past_due', 'canceled'].includes(status) && end !== null && new Date(end).getTime() > now;
}
export function identityCapability(premium: boolean, verified: boolean) { return premium && verified; }