import { createFileRoute, Link } from "@tanstack/react-router";
import { Discovery } from '@/components/Discovery';
import { Heart, ShieldCheck, Flame, Sparkles, Tv, Users, Camera, MessageCircle } from "lucide-react";
import aiko from "@/assets/char-aiko.jpg";
import ren from "@/assets/char-ren.jpg";
import kai from "@/assets/char-kai.jpg";
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/SessionProvider';

export const Route = createFileRoute("/")({ staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "KamiMatch — 18+ ID-verified anime dating" },
      { name: "description", content: "Swipe for your anime soulmate. Match on archetypes, tropes and Anime DNA in an adults-only, ID-verified community." },
      { property: "og:title", content: "KamiMatch — Find your anime soulmate" },
      { property: "og:description", content: "Swipe on archetypes and anime taste. 18+ only, every profile ID verified." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="petal" style={{ left: `${((i * 41) % 100) + 3}%`, animationDuration: `${9 + (i % 6) * 2}s`, animationDelay: `${i * 0.6}s` }} />
      ))}
    </div>
  );
}

const STEPS = [
  { icon: Sparkles, title: "Build your Anime DNA", text: "Pick your favourite shows, characters and tropes (story patterns) — that's how we match your taste." },
  { icon: ShieldCheck, title: "Verify once", text: "A quick ID and live selfie check keeps everyone real, adult and accountable. No approval, no meeting." },
  { icon: Heart, title: "Swipe for your soulmate", text: "Match on archetypes (personality types) and shared anime — then chat, send voice notes and join watch parties." },
];

const FEATURES = [
  { icon: Tv, title: "Watch parties & clubs", text: "Host episode rooms, play Watch Party Bingo and find a Seasonal Buddy (one show, watched together)." },
  { icon: Users, title: "Communities", text: "Convention Companions (event buddies), clubs and rooms for every fandom." },
  { icon: Camera, title: "Anime portraits", text: "Your photos become anime-style art. Reveal your real photo to a match only when you feel ready." },
  { icon: MessageCircle, title: "Real conversation", text: "Icebreakers, realtime chat and voice notes — plus Blind Date mode for taste-first matching." },
];

function Index() {
  const { user } = useSession();

  if (user) return <Discovery />;
  return (
    <main className="sakura-sky relative min-h-screen font-sans text-foreground">
      <Petals />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24">
        <header className="flex items-center justify-center gap-1.5 py-5">
          <Flame className="h-7 w-7 text-primary" fill="currentColor" />
          <span className="text-brand font-display text-2xl">kamimatch</span>
        </header>

        <section className="text-center">
          <div className="mx-auto flex justify-center -space-x-6">
            {[aiko, ren, kai].map((img, i) => (
              <img key={i} src={img} alt="" width={768} height={1024} className="h-28 w-24 rounded-2xl border-4 border-card object-cover shadow-card" style={{ transform: `rotate(${(i - 1) * 7}deg)` }} />
            ))}
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight">Find your <span className="text-brand">anime soulmate</span></h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
            The dating app for anime fans. Match on archetypes, tropes and Anime DNA — in an adults-only community where every member is ID verified.
          </p>
          <Button asChild className="mt-6 h-14 w-full rounded-full bg-brand font-extrabold shadow-card"><Link to="/auth">Create your character</Link></Button>
          <p className="mt-3 text-xs text-muted-foreground">18+ only · ID + live selfie verification required before anyone can meet</p>
        </section>

        <section className="mt-10">
          <h2 className="text-center font-display text-2xl">How it works</h2>
          <div className="mt-4 space-y-3">
            {STEPS.map((s, i) => (
              <article key={s.title} className="flex gap-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-card">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-primary"><s.icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-sm font-extrabold">{i + 1}. {s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-center font-display text-2xl">More than swiping</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-card">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-2 text-sm font-extrabold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[var(--radius)] border border-border bg-card p-5 text-center shadow-card">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-2 font-display text-xl">Safe by design</h2>
          <p className="mx-auto mt-2 max-w-xs text-xs text-muted-foreground">
            Every profile passes a government ID and live selfie check. Reports go to a human reviewer, and blocking is instant and permanent.
          </p>
        </section>

        <div className="mt-10 text-center">
          <Button asChild className="h-14 w-full rounded-full bg-brand font-extrabold shadow-card"><Link to="/auth">Join KamiMatch free</Link></Button>
          <p className="mt-3 text-xs text-muted-foreground">Free plan included · Premium £7.99/month for unlimited reveals, filters and more</p>
        </div>
      </div>
    </main>
  );
}
