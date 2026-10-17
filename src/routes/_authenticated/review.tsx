import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { getReviewQueue, reviewIdentity } from '@/lib/account.functions';
import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';

const options = () => queryOptions({ queryKey: ['identity-review'], queryFn: () => getReviewQueue(), staleTime: 0 });
export const Route = createFileRoute('/_authenticated/review')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options()),
  head: () => ({ meta: [{ title: 'Identity review — WaifuMatch' }, { name: 'description', content: 'Authorised private identity review for WaifuMatch members.' }, { property: 'og:title', content: 'Identity review — WaifuMatch' }, { property: 'og:description', content: 'Restricted adult identity review.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'robots', content: 'noindex' }] }),
  component: ReviewPage,
});

function ReviewPage() {
  const { data } = useSuspenseQuery(options());
  const review = useServerFn(reviewIdentity);
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  async function decide(id: string, status: 'approved' | 'rejected') {
    setBusy(id); setError('');
    try { await review({ data: { id, status, note: notes[id] ?? '' } }); await queryClient.invalidateQueries({ queryKey: ['identity-review'] }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not save your decision.'); }
    finally { setBusy(''); }
  }
  return <AccountShell title="Identity review" subtitle="Check the photo, date of birth and selfie carefully. Never approve an uncertain match.">
    {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}{data.submissions.length === 0 && <p className="border-y border-border py-8 text-center text-muted-foreground">No checks awaiting review.</p>}
    <div className="space-y-8">{data.submissions.map((row) => <section key={row.id} className="border-b border-border pb-8"><h2 className="font-display text-2xl">{row.name}, {row.age}</h2><p className="mt-1 text-xs text-muted-foreground">Date of birth: {row.birthDate} · Submitted {new Date(row.submittedAt).toLocaleDateString()}</p><div className="mt-4 grid grid-cols-2 gap-3">{row.idUrl && <a href={row.idUrl} target="_blank" rel="noreferrer" className="rounded-md border border-border bg-card p-4 text-center text-sm font-bold text-primary">Open private ID</a>}{row.selfieUrl && <img src={row.selfieUrl} alt={`${row.name}'s selfie for review`} className="h-40 w-full rounded-md object-cover" />}</div><label className="mt-4 flex items-start gap-2 text-xs"><input type="checkbox" checked={checked[row.id] ?? false} onChange={(e) => setChecked((p) => ({ ...p, [row.id]: e.target.checked }))} className="accent-primary" />I checked that the ID is readable, shows an adult birth date matching the profile, and the ID photo matches the live selfie.</label><textarea aria-label={`Review note for ${row.name}`} value={notes[row.id] ?? ''} onChange={(e) => setNotes((p) => ({ ...p, [row.id]: e.target.value }))} maxLength={500} placeholder="Reason or feedback (required when rejecting)" className="mt-3 w-full rounded-md border border-input bg-card p-3 text-sm" /><div className="mt-3 flex gap-2"><Button disabled={busy !== '' || !checked[row.id] || row.user_id === data.reviewerId || !row.idUrl || !row.selfieUrl} onClick={() => decide(row.id, 'approved')} className="flex-1"><Check />Approve</Button><Button disabled={busy !== '' || !notes[row.id]?.trim() || row.user_id === data.reviewerId} onClick={() => decide(row.id, 'rejected')} variant="outline" className="flex-1"><X />Request another try</Button></div></section>)}</div>
  </AccountShell>;
}