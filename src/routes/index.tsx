import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, EyeOff, Heart, Tv, Dices, Zap } from "lucide-react";
import hero from "@/assets/hero-girl.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WaifuMatch — 18+ ID-verified anime dating" },
      { name: "description", content: "Find your anime soulmate. Match on archetypes, tropes and your Anime DNA in an adults-only, ID-verified community." },
      { property: "og:title", content: "WaifuMatch — Find your anime soulmate" },
      { property: "og:description", content: "Archetype matching, Anime DNA profiles and Blind Date mode. 18+ only, ID verified." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const archetypes = [
  { n: "Tsundere", jp: "ツンデレ", c: "bg-primary text-primary-foreground" },
  { n: "Kuudere", jp: "クーデレ", c: "bg-secondary text-secondary-foreground" },
  { n: "Genki", jp: "元気", c: "bg-accent text-accent-foreground" },
  { n: "Dandere", jp: "ダンデレ", c: "bg-card text-card-foreground" },
  { n: "Yandere", jp: "ヤンデレ", c: "bg-primary text-primary-foreground" },
  { n: "Soft Boy", jp: "ソフト", c: "bg-secondary text-secondary-foreground" },
  { n: "Rival Energy", jp: "ライバル", c: "bg-accent text-accent-foreground" },
  { n: "Cool Beauty", jp: "クール", c: "bg-card text-card-foreground" },
];

const features = [
  { icon: Sparkles, t: "Archetype Matching", jp: "相性", d: "Rank yourself and your ideal across classic archetypes. Tsundere × Soft Boy? We know the math.", c: "bg-primary text-primary-foreground", r: "-rotate-1" },
  { icon: Heart, t: "Anime DNA", jp: "遺伝子", d: "Top 10, favourite characters, tropes, seasonal watchlist. Your profile is a character sheet.", c: "bg-card text-card-foreground", r: "rotate-1" },
  { icon: EyeOff, t: "Blind Date Mode", jp: "目隠し", d: "No photos. Just vibes, archetypes and taste. Reveal when it clicks.", c: "bg-secondary text-secondary-foreground", r: "-rotate-1" },
  { icon: Tv, t: "Watch Parties", jp: "一緒に", d: "Drop an invite for the new episode and scream at the cliffhanger together.", c: "bg-accent text-accent-foreground", r: "rotate-1" },
  { icon: Dices, t: "Daily Soulmate Pull", jp: "ガチャ", d: "A gentle gacha of hand-picked matches every day. SSR soulmates only.", c: "bg-card text-card-foreground", r: "-rotate-1" },
  { icon: ShieldCheck, t: "Verified Adults", jp: "安全", d: "Government ID + live selfie, reviewed before anyone can match or message.", c: "bg-primary text-primary-foreground", r: "rotate-1" },
];

function Petals() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="petal" style={{ left: `${((i * 37) % 100) + 5}%`, animationDuration: `${8 + (i % 5) * 2}s`, animationDelay: `${i * 0.7}s` }} />
      ))}
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background font-sans text-foreground">
      {/* Age gate ribbon */}
      <div className="border-b-[3px] border-ink bg-accent py-2 text-center text-xs font-extrabold uppercase tracking-wide text-accent-foreground">
        <ShieldCheck className="mr-1 inline h-4 w-4" />
        18+ only — you must verify your identity to use WaifuMatch
      </div>

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <span className="font-display text-2xl">
          Waifu<span className="text-primary">Match</span>
          <span className="ml-1 text-xs text-secondary">ワイフ</span>
        </span>
        <Link to="/" className="panel pop-press bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground">
          Join ✦
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="halftone absolute inset-0 opacity-40" aria-hidden />
        <Petals />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1.1fr_1fr] md:pt-12">
          <div className="relative z-10">
            <div className="panel inline-flex -rotate-2 items-center gap-2 bg-secondary px-3 py-1 text-xs font-extrabold text-secondary-foreground">
              <ShieldCheck className="h-4 w-4" /> 18+ ONLY • ID VERIFIED
            </div>
            <p className="mt-6 font-display text-6xl leading-none text-primary opacity-90 md:text-7xl" aria-hidden>
              運命の人
            </p>
            <h1 className="text-outline mt-2 font-display text-5xl leading-[1.05] md:text-7xl">
              Find your <span className="text-accent">anime</span> soulmate.
            </h1>
            <p className="mt-6 max-w-md text-lg font-bold text-muted-foreground">
              Matched by archetypes, tropes and the shows that broke your heart — not just a face. Every member is a verified adult.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/" className="panel pop-press bg-primary px-7 py-4 font-display text-lg text-primary-foreground">
                Create your character →
              </Link>
              <a href="#safety" className="panel pop-press bg-card px-6 py-4 font-extrabold text-card-foreground">
                How we verify
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="speedlines absolute -inset-10 rounded-full" aria-hidden />
            <div className="panel relative rotate-2 overflow-hidden bg-card">
              <img src={hero} alt="Pink-haired anime character winking and throwing a peace sign" width={1024} height={1280} className="block" />
              <div className="absolute left-3 top-3 panel bg-accent px-2 py-1 text-xs font-extrabold text-accent-foreground">
                GENKI ✦ ISEKAI ✦ SLOW BURN
              </div>
            </div>
            {/* Speech bubble */}
            <div className="panel wobble absolute -left-6 -top-6 bg-card px-4 py-2 font-display text-lg text-card-foreground md:-left-14">
              ドキドキ!
            </div>
            {/* Match card */}
            <div className="panel absolute -bottom-10 -left-4 right-6 -rotate-2 bg-ink p-4 text-foreground md:-left-16">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-accent">87%</span>
                <span className="text-[10px] font-extrabold uppercase text-secondary">ID Verified • 18+</span>
              </div>
              <p className="mt-1 text-xs font-bold text-muted-foreground">
                Both love psych thrillers · tsundere × soft energy · Steins;Gate in both top 5s
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="mt-16 -rotate-1 overflow-hidden border-y-[3px] border-ink bg-primary py-3">
        <div className="marquee flex w-max gap-8 whitespace-nowrap font-display text-xl text-primary-foreground">
          {[0, 1].map((k) =>
            ["ENEMIES TO LOVERS", "★", "SLOW BURN", "★", "FOUND FAMILY", "★", "ISEKAI", "★", "CHILDHOOD FRIENDS", "★", "RIVALS", "★"].map((t, i) => (
              <span key={`${k}-${i}`}>{t}</span>
            )),
          )}
        </div>
      </div>

      {/* Archetypes */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-4xl md:text-5xl">
          Pick your <span className="text-secondary">type</span>.
        </h2>
        <p className="mt-2 font-bold text-muted-foreground">Rank yourself and your ideal partner. Opposites attract — or rivals do.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {archetypes.map((a, i) => (
            <div key={a.n} className={`panel pop-press ${a.c} ${i % 2 ? "rotate-1" : "-rotate-1"} p-4`}>
              <div className="font-display text-2xl leading-none">{a.jp}</div>
              <div className="mt-2 text-sm font-extrabold uppercase">{a.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features as manga panels */}
      <section className="relative py-16">
        <div className="halftone absolute inset-0 opacity-20" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, t, jp, d, c, r }) => (
            <div key={t} className={`panel pop-press ${c} ${r} relative p-6`}>
              <span className="absolute right-4 top-3 font-display text-3xl opacity-25">{jp}</span>
              <Icon className="h-8 w-8" strokeWidth={2.5} />
              <h3 className="mt-4 font-display text-2xl">{t}</h3>
              <p className="mt-2 text-sm font-bold opacity-80">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mx-auto max-w-6xl px-5 py-20">
        <div className="panel bg-accent p-8 text-accent-foreground md:p-12">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8" strokeWidth={3} />
            <h2 className="font-display text-3xl md:text-4xl">Adults only. Seriously.</h2>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {["Confirm you're 18 or older", "Upload a government ID", "Take a live selfie — a human reviews it"].map((s, i) => (
              <li key={s} className="panel bg-card p-4 font-extrabold text-card-foreground">
                <span className="font-display text-3xl text-primary">0{i + 1}</span>
                <p className="mt-1">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 font-bold">No matching or messaging until you're approved. Report and block on every profile.</p>
        </div>
      </section>

      <footer className="border-t-[3px] border-ink py-8 text-center text-xs font-bold text-muted-foreground">
        WaifuMatch ワイフマッチ · Strictly for verified adults (18+)
      </footer>
    </main>
  );
}
