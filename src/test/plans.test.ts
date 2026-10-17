import { describe, expect, it } from 'vitest';
import { PREMIUM_MONTHLY_GBP, PHOTO_ALLOWANCE, videoAllowed } from '@/lib/plans';
describe('Affordable premium',()=>{
 it('keeps the monthly price within the requested £4.99–£9.99 range',()=>{expect(PREMIUM_MONTHLY_GBP).toBeGreaterThanOrEqual(4.99);expect(PREMIUM_MONTHLY_GBP).toBeLessThanOrEqual(9.99);});
 it('restricts videos to premium',()=>{expect(videoAllowed(false)).toBe(false);expect(videoAllowed(true)).toBe(true);});
 it('provides free photo conversions and more with premium',()=>{expect(PHOTO_ALLOWANCE.free).toBe(2);expect(PHOTO_ALLOWANCE.premium).toBe(10);});
});
