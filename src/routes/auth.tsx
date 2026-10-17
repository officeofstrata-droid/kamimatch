import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import { lovable } from '@/integrations/lovable';
import { useSession } from '@/components/SessionProvider';
import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';
import aiko from '@/assets/char-aiko.jpg';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Sign in — WaifuMatch' }, { name: 'description', content: 'Create your adult anime dating profile with secure sign-in.' }, { property: 'og:title', content: 'Sign in — WaifuMatch' }, { property: 'og:description', content: 'Join WaifuMatch and create your anime dating profile.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [adult, setAdult] = useState(false);
  useEffect(() => { if (user) void navigate({ to: '/profile', replace: true }); }, [user, navigate]);
  async function signIn(provider: 'google' | 'lovable') {
    setBusy(true); setError('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setError('Sign-in did not finish. Please try again.');
    } catch { setError('Sign-in is unavailable right now. Please try again.'); }
    finally { setBusy(false); }
  }
  return <AccountShell title="Your story starts here" subtitle="Real people. Shared favourites. A little cherry-blossom magic.">
    <img src={aiko} alt="Original anime character among cherry blossoms" className="h-56 w-full rounded-[var(--radius)] object-cover object-[center_30%] shadow-card" />
    <label className="mt-6 flex items-start gap-3 text-sm font-bold"><input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />I am 18 or older and agree to respectful, adults-only dating.</label>
    <div className="mt-5 space-y-3"><Button disabled={!adult || busy} onClick={() => signIn('google')} className="h-12 w-full rounded-full bg-brand font-bold">Continue with Google</Button><Button disabled={!adult || busy} onClick={() => signIn('lovable')} variant="outline" className="h-12 w-full rounded-full font-bold"><Heart />Continue with Lovable</Button></div>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    <p className="mt-6 flex gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" />An ID and a live camera selfie must be reviewed before you can meet anyone. Your documents are private.</p>
    <Link to="/communities" className="mt-6 block text-center text-sm font-bold text-primary">Browse anime communities</Link>
  </AccountShell>;
}