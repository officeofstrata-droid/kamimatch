// Free members can form up to 5 new matches per calendar month (UTC).
// Swiping stays unlimited; texting existing matches stays free for everyone.
// Mirrored by the cast_swipe database function — keep both in sync.
export const FREE_MATCH_MONTHLY_LIMIT = 5;

export function matchQuota(premium: boolean, matchesThisMonth: number): { allowed: boolean; remaining: number | null } {
  if (premium) return { allowed: true, remaining: null };
  const remaining = Math.max(0, FREE_MATCH_MONTHLY_LIMIT - matchesThisMonth);
  return { allowed: remaining > 0, remaining };
}
