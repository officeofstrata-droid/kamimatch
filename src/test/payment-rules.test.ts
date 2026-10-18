import { describe, expect, it } from 'vitest';
import { identityCapability, paidAccess, PREMIUM_PRICE_ID } from '@/lib/payment-rules';
import { PREMIUM_MONTHLY_GBP } from '@/lib/plans';
describe('Premium purchase rules', () => {
  const now = Date.parse('2026-10-18T00:00:00Z');
  const future = '2026-11-18T00:00:00Z';
  it('keeps the single Premium plan at £7.99 monthly', () => { expect(PREMIUM_MONTHLY_GBP).toBe(7.99); expect(PREMIUM_PRICE_ID).toBe('waifumatch_premium_monthly'); });
  it('unlocks immediately on active paid membership', () => { expect(paidAccess('active', future, now)).toBe(true); expect(paidAccess('incomplete', future, now)).toBe(false); });
  it('keeps canceled access until the billing period ends', () => { expect(paidAccess('canceled', future, now)).toBe(true); expect(paidAccess('canceled', '2026-10-18T00:00:00Z', now)).toBe(false); });
  it('never lets a purchase replace identity approval for videos', () => { expect(identityCapability(true, false)).toBe(false); expect(identityCapability(true, true)).toBe(true); expect(identityCapability(false, true)).toBe(false); });
  it('retains access during retries but not exhausted payments', () => { expect(paidAccess('past_due', future, now)).toBe(true); expect(paidAccess('unpaid', future, now)).toBe(false); });
});