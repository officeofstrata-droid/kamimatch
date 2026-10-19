import { describe, expect, it } from 'vitest';
import { FREE_MATCH_MONTHLY_LIMIT, matchQuota } from '@/lib/match-rules';

describe('monthly match quota', () => {
  it('caps free members at 5 matches per month', () => {
    expect(FREE_MATCH_MONTHLY_LIMIT).toBe(5);
    expect(matchQuota(false, 4)).toEqual({ allowed: true, remaining: 1 });
    expect(matchQuota(false, 5)).toEqual({ allowed: false, remaining: 0 });
    expect(matchQuota(false, 9).allowed).toBe(false);
  });

  it('gives premium members unlimited matches', () => {
    expect(matchQuota(true, 50)).toEqual({ allowed: true, remaining: null });
  });
});
