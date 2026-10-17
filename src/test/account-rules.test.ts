import { describe, expect, it } from 'vitest';
import { ageOn, canMeet, canReview, preferencesSchema, profileSchema } from '@/lib/account-rules';

const today = new Date('2026-10-17T12:00:00Z');
describe('Adult safety', () => {
  it('rejects nonexistent calendar birth dates', () => { expect(ageOn('2000-02-31', today)).toBe(-1); expect(ageOn('2000-02-29', today)).toBe(26); });
  it('requires the eighteenth birthday to have happened', () => { expect(ageOn('2008-10-18', today)).toBe(17); expect(ageOn('2008-10-17', today)).toBe(18); });
  it('rejects an underage profile on the server input boundary', () => { expect(profileSchema.safeParse({ display_name: 'Sam', birth_date: '2020-01-01', bio: '', city: '', archetype: '', watching: '', avatar: 'aiko', consent: true }).success).toBe(false); });
  it('only allows approved identity checks to meet', () => { expect(canMeet('pending')).toBe(false); expect(canMeet('rejected')).toBe(false); expect(canMeet(null)).toBe(false); expect(canMeet('approved')).toBe(true); });
  it('requires an administrator and disallows self-review', () => { expect(canReview(false, 'reviewer', 'member')).toBe(false); expect(canReview(true, 'member', 'member')).toBe(false); expect(canReview(true, 'reviewer', 'member')).toBe(true); });
});
describe('Top 10 limits', () => {
  const base = { picked: { anime: [], characters: [], moves: [] }, filler: 3, dub: 'sub', rewatch: 2, mood: 'Cozy' };
  for (const category of ['anime', 'characters', 'moves'] as const) {
    it(`caps ${category} at ten picks`, () => {
      expect(preferencesSchema.safeParse({ ...base, picked: { ...base.picked, [category]: Array.from({ length: 10 }, (_, i) => String(i)) } }).success).toBe(true);
      expect(preferencesSchema.safeParse({ ...base, picked: { ...base.picked, [category]: Array.from({ length: 11 }, (_, i) => String(i)) } }).success).toBe(false);
    });
  }
});