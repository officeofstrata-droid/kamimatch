import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Check, RefreshCw, Flag } from 'lucide-react';
import { getReports, closeReport } from '@/lib/dating.functions';
import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';

const options = () => queryOptions({ queryKey: ['report-review'], queryFn: () => getReports(), staleTime: 0 });
export const Route = createFileRoute('/_authenticated/reports')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options()),
  head: () => ({ meta: [{ title: 'Safety reports — WaifuMatch' }, { name: 'description', content: 'Restricted review of member safety reports.' }, { property: 'og:title', content: 'Safety reports — WaifuMatch' }, { property: 'og:description', content: 'Authorised member safety review.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }, { name: 'robots', content: 'noindex' }] }),
  component: Reports,
});

function Reports() {
  const { data } = useSuspenseQuery(options());
  const close = useServerFn(closeReport);
  const client = useQueryClient();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  async function resolve(id: string) {
    setBusy(id); setError('');
    try { await close({ data: { id } }); await client.invalidateQueries({ queryKey: ['report-review'] }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not update this report.'); }
    finally { setBusy(''); }
  }
  return <AccountShell title="Safety reports">
    <Button variant="outline" onClick={() => client.invalidateQueries({ queryKey: ['report-review'] })}><RefreshCw />Refresh</Button>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {!data.length && <p className="mt-6 border-y border-border py-8 text-center text-muted-foreground">No reports awaiting review.</p>}
    <div className="mt-5 space-y-6">{data.map(report => <article key={report.id} className="border-b border-border pb-6">
      <h2 className="flex items-center gap-2 font-display text-xl"><Flag className="h-4 w-4 text-primary" />Member report</h2>
      <time className="mt-2 block text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString()}</time>
      <dl className="mt-3 space-y-2 text-xs"><div><dt className="font-bold">Reported account</dt><dd className="break-all">{report.reported_id}</dd></div><div><dt className="font-bold">Reporting account</dt><dd className="break-all">{report.reporter_id}</dd></div></dl>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm">{report.reason}</p>
      <Button className="mt-4" disabled={busy !== ''} onClick={() => resolve(report.id)}><Check />{busy === report.id ? 'Saving…' : 'Mark reviewed'}</Button>
    </article>)}</div>
  </AccountShell>;
}