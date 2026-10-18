import { describe, expect, it } from 'vitest';
import { FREE_REVEAL_MONTHLY_LIMIT, revealQuota } from './reveal-rules';

describe('real-photo reveal quota', () => {
  it('free members get exactly 2 reveals a month', () => {
    expect(FREE_REVEAL_MONTHLY_LIMIT).toBe(2);
    expect(revealQuota(false, 0)).toMatchObject({ allowed: true, remaining: 2 });
    expect(revealQuota(false, 1)).toMatchObject({ allowed: true, remaining: 1 });
  });

  it('free members are blocked after 2 reveals in the month', () => {
    expect(revealQuota(false, 2)).toMatchObject({ allowed: false, remaining: 0 });
    expect(revealQuota(false, 5)).toMatchObject({ allowed: false, remaining: 0 });
  });

  it('premium members have unlimited reveals', () => {
    expect(revealQuota(true, 0)).toMatchObject({ allowed: true, remaining: null });
    expect(revealQuota(true, 50)).toMatchObject({ allowed: true, remaining: null });
  });
});
