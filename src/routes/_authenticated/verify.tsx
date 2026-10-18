import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getAccount } from '@/lib/account.functions';
import { DiditCheck } from '@/components/DiditCheck';
import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';

const options = () => queryOptions({ queryKey: ['account'], queryFn: () => getAccount() });
export const Route = createFileRoute('/_authenticated/verify')({
  staticData: { sitemap: false },
  loader: ({ context }) => context.queryClient.ensureQueryData(options()),
  head: () => ({ meta: [{ title: 'Didit identity check — KamiMatch' }, { name: 'description', content: 'Verify your adult identity privately with Didit using government ID, live selfie and face matching.' }, { property: 'og:title', content: 'Didit identity check — KamiMatch' }, { property: 'og:description', content: 'Private government ID and live selfie checks with Didit for adult dating safety.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { data: account } = useSuspenseQuery(options());
  return <AccountShell title="A real you, behind the avatar" subtitle="Government ID, a live selfie and face matching. Privately checked by Didit. Adults only.">
    {account.details ? <DiditCheck /> : <div className="space-y-4"><p className="text-sm">Save your profile and date of birth before starting your identity check.</p><Button asChild className="rounded-full"><Link to="/profile">Complete my profile</Link></Button></div>}
    <Button asChild variant="outline" className="mt-4 rounded-full"><Link to="/profile">Back to my profile</Link></Button>
  </AccountShell>;
}
