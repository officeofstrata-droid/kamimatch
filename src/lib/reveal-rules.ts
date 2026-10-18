// Real-photo reveal quota. Mirrored in the reserve_reveal database function —
// keep both in sync: free members get 2 reveals per UTC month, premium unlimited.
export const FREE_REVEAL_MONTHLY_LIMIT = 2;

export function revealQuota(premium: boolean, usedThisMonth: number, now = new Date()) {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  if (premium) return { allowed: true, remaining: null as number | null, monthStart };
  const remaining = Math.max(0, FREE_REVEAL_MONTHLY_LIMIT - usedThisMonth);
  return { allowed: remaining > 0, remaining, monthStart };
}
