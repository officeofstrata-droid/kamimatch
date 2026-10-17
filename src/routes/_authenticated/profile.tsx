import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { Check, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { getAccount, saveProfile } from '@/lib/account.functions';
import { profileSchema } from '@/lib/account-rules';
import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import aiko from '@/assets/char-aiko.jpg';
import ren from '@/assets/char-ren.jpg';
import kai from '@/assets/char-kai.jpg';

export const accountOptions = () => queryOptions({ queryKey: ['account'], queryFn: () => getAccount() });
export const Route = createFileRoute('/_authenticated/profile')({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountOptions()),
  head: () => ({ meta: [{ title: 'Your profile — WaifuMatch' }, { name: 'description', content: 'Set up your adult profile, anime taste and private identity check.' }, { property: 'og:title', content: 'Your profile — WaifuMatch' }, { property: 'og:description', content: 'Your personal WaifuMatch profile and safety status.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: account } = useSuspenseQuery(accountOptions());
  const save = useServerFn(saveProfile);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState({ display_name: account.profile?.display_name ?? '', birth_date: account.details?.birth_date ?? '', bio: account.profile?.bio ?? '', city: account.profile?.city ?? '', watching: account.profile?.watching ?? '', archetype: account.profile?.archetype ?? 'Warm and caring', avatar: (account.profile?.avatar ?? 'aiko') as 'aiko' | 'ren' | 'kai', consent: false });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const update = (key: keyof typeof form, value: string | boolean) => setForm((prev) => ({ ...prev, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setNotice('');
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Please check your details.'); return; }
    setBusy(true);
    try { await save({ data: parsed.data }); await queryClient.invalidateQueries({ queryKey: ['account'] }); setNotice('Your profile is saved. Next, choose your favourites and complete your identity check.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await navigate({ to: '/auth', replace: true }); }
  return <AccountShell title={account.profile ? 'Your character, your story' : 'Create your character'} subtitle="Your anime portrait is an avatar, not a verified photograph.">
    <div className="mb-6 flex items-center gap-3 border-b border-border pb-5"><ShieldCheck className="text-primary" /><div><p className="text-sm font-bold">{account.identity?.status === 'approved' ? 'Identity approved' : account.identity?.status === 'pending' ? 'Identity review pending' : account.identity?.status === 'rejected' ? 'Identity check needs another try' : 'Identity check not started'}</p><p className="text-xs text-muted-foreground">Meeting stays locked until approval.</p></div></div>
    <form onSubmit={submit} className="space-y-5">
      <fieldset><legend className="mb-2 text-sm font-bold">Choose your portrait</legend><div className="flex gap-3">{([{ id: 'aiko', image: aiko }, { id: 'ren', image: ren }, { id: 'kai', image: kai }] as const).map((item) => <Button key={item.id} type="button" aria-label={`Choose ${item.id} portrait`} aria-pressed={form.avatar === item.id} variant="ghost" className={`relative h-24 w-20 overflow-hidden rounded-lg p-0 ${form.avatar === item.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`} onClick={() => update('avatar', item.id)}><img src={item.image} alt={`${item.id} anime portrait`} className="h-full w-full object-cover" />{form.avatar === item.id && <Check className="absolute bottom-1 right-1 rounded-full bg-primary text-primary-foreground" />}</Button>)}</div></fieldset>
      <label className="block text-sm font-bold">Display name<Input required minLength={2} maxLength={40} value={form.display_name} onChange={(e) => update('display_name', e.target.value)} className="mt-2 bg-card" /></label>
      <label className="block text-sm font-bold">Date of birth <span className="text-xs font-normal text-muted-foreground">(private)</span><Input type="date" required disabled={!!account.details} value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} className="mt-2 bg-card" /></label>
      <label className="block text-sm font-bold">City <span className="text-xs font-normal text-muted-foreground">(optional)</span><Input maxLength={80} value={form.city} onChange={(e) => update('city', e.target.value)} className="mt-2 bg-card" /></label>
      <label className="block text-sm font-bold">Your personality<select value={form.archetype} onChange={(e) => update('archetype', e.target.value)} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm"><option>Warm and caring</option><option>Tsundere (tough outside, caring inside)</option><option>Kuudere (quiet and calm, thoughtful underneath)</option><option>Genki (bubbly and full of energy)</option><option>Playful and adventurous</option></select></label>
      <label className="block text-sm font-bold">Currently watching<Input maxLength={100} value={form.watching} onChange={(e) => update('watching', e.target.value)} className="mt-2 bg-card" /></label>
      <label className="block text-sm font-bold">A little about you<textarea maxLength={500} rows={4} value={form.bio} onChange={(e) => update('bio', e.target.value)} className="mt-2 w-full rounded-md border border-input bg-card p-3 text-sm" /></label>
      <label className="flex items-start gap-2 text-xs leading-relaxed"><input type="checkbox" required checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 accent-primary" />I confirm these details are accurate, I am 18+, and I will respect consent and other members.</label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{notice && <p role="status" className="text-sm text-primary">{notice}</p>}
      <Button type="submit" disabled={busy} className="h-12 w-full rounded-full bg-brand font-bold">{busy ? 'Saving…' : 'Save my profile'}</Button>
    </form>
    <div className="mt-6 space-y-3"><Button asChild variant="outline" className="h-12 w-full rounded-full"><Link to="/top10"><Sparkles />Choose my top 10</Link></Button><Button asChild disabled={!account.details} className="h-12 w-full rounded-full"><Link to="/verify"><ShieldCheck />Verify my identity</Link></Button>{account.isAdmin && <Button asChild variant="outline" className="w-full"><Link to="/review">Identity review queue</Link></Button>}<Button onClick={signOut} variant="ghost" className="w-full text-muted-foreground"><LogOut />Sign out</Button></div>
  </AccountShell>;
}