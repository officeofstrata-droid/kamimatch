import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, EyeOff, Heart, Tv, Dices } from "lucide-react";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WaifuMatch — 18+ ID-verified anime dating" },
      { name: "description", content: "Find your anime soulmate. Match on archetypes, tropes and your Anime DNA — an adults-only, ID-verified community." },
      { property: "og:title", content: "WaifuMatch — Find your anime soulmate" },
      { property: "og:description", content: "Archetype matching, Anime DNA profiles and Blind Date mode. 18+ only, ID verified." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const archetypes = ["Tsundere", "Kuudere", "Dandere", "Genki", "Yandere", "Cool Beauty", "Soft Boy", "Rival Energy"];

const features = [
  { icon: Sparkles, t: "Archetype Matching", d: "Rank yourself and your ideal partner across classic archetypes. Complementary energy wins." },
  { icon: Heart, t: "Anime DNA", d: "Top 10, favorite characters, tropes, seasonal watchlist — your profile is a character sheet." },
  { icon: EyeOff, t: "Blind Date Mode", d: "No photos. Just archetypes and taste. Reveal when the chemistry is real." },
  { icon: Tv, t: "Watch Parties", d: "Invite a match to watch the new episode together and talk through the cliffhanger." },
  { icon: Dices, t: "Daily Soulmate Pull", d: "A gentle gacha of curated matches each day. Quality over endless swiping." },
  { icon: ShieldCheck, t: "Verified Adults Only", d: "Government ID + live selfie check before anyone can match or message." },
];

function Petals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="petal" style={{ left: `${(i * 37) % 100 + 10}%`, animationDuration: `${9 + (i % 5) * 2}s`, animationDelay: `${i * 0.8}s` }} />
      ))}
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="border-b border-border bg-muted py-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-secondary" />
        You must be 18 or older and verify your identity to use WaifuMatch.
      </div>

      <section className="relative overflow-hidden">
        <Petals />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 px-3 py-1 text-xs text-secondary">
              <ShieldCheck className="h-3.5 w-3.5" /> 18+ Only • ID Verified
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-tight md:text-6xl">
              Find your <span className="text-neon">anime soulmate</span>.
            </h1>
            <p className="mt-2 font-display text-lg text-muted-foreground">運命の相手 — not another swipe app.</p>
            <p className="mt-5 max-w-md text-muted-foreground">
              Match on archetypes, tropes and the shows that shaped you. Every member is a verified adult.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-neon px-6 py-3 font-bold text-primary-foreground shadow-glow transition hover:scale-105">
                Create your character
              </button>
              <button className="rounded-full border border-border px-6 py-3 font-medium hover:bg-muted">How verification works</button>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Two anime characters on a neon Tokyo rooftop under falling sakura" width={1024} height={1280} className="rounded-3xl border border-border shadow-glow" />
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-extrabold text-neon">87% match</span>
                <span className="text-xs text-secondary">ID Verified • 18+</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Both love psychological thrillers, complementary tsundere/soft energy, and Steins;Gate in your top 5.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <div className="flex flex-wrap justify-center gap-2">
          {archetypes.map((a) => (
            <span key={a} className="rounded-full border border-accent/40 bg-muted px-4 py-1.5 text-sm">{a}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-glow">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-display text-xl font-bold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        WaifuMatch is strictly for verified adults (18+). Report and moderation tools on every profile.
      </footer>
    </main>
  );
}
