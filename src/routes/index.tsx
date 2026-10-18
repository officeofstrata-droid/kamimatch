import { createFileRoute, Link } from "@tanstack/react-router";
import { Discovery } from '@/components/Discovery';
import { useRef, useState } from "react";
import { Heart, X, Star, RotateCcw, ShieldCheck, Flame, MessageCircle, User, Sparkles, Tv } from "lucide-react";
import ren from "@/assets/char-ren.jpg";
import aiko from "@/assets/char-aiko.jpg";
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

type Profile = { name: string; age: number; img: string; archetype: string; match: number; watching: string; tags: string[]; why: string };

const ARCHETYPE_NOTES: Record<string, string> = {
  Tsundere: "acts tough or cold, but is secretly soft and caring",
  Kuudere: "calm, quiet and hard to read, but thoughtful underneath",
  Genki: "bubbly, loud and full of energy all the time",
};

const TAG_NOTES: Record<string, string> = {
  "Slow burn": "romance builds slowly",
  "Enemies to lovers": "haters who fall for each other",
  "Steins;Gate": "a time-travel thriller",
  "Psych thriller": "dark, tense mind games",
  "Found family": "friends become each other's family",
  "Death Note": "a battle of wits",
  "Sports anime": "training, teams, big wins",
  Rivals: "they compete, then grow closer",
  Isekai: "pulled into another world",
};

const PROFILES: Profile[] = [
  { name: "Aiko", age: 24, img: aiko, archetype: "Tsundere", match: 92, watching: "Frieren S2", tags: ["Slow burn", "Enemies to lovers", "Steins;Gate"], why: "It's not like I wanted you to swipe right or anything…" },
  { name: "Ren", age: 27, img: ren, archetype: "Kuudere", match: 87, watching: "Monster", tags: ["Psych thriller", "Found family", "Death Note"], why: "Quiet, observant, will remember your favourite OST (soundtrack)." },
  { name: "Kai", age: 25, img: kai, archetype: "Genki", match: 81, watching: "Haikyuu!!", tags: ["Sports anime", "Rivals", "Isekai"], why: "Will drag you to every cosplay con (costume convention). Brings snacks." },
];

function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="petal" style={{ left: `${((i * 41) % 100) + 3}%`, animationDuration: `${9 + (i % 6) * 2}s`, animationDelay: `${i * 0.6}s` }} />
      ))}
    </div>
  );
}

function SwipeCard({ p, top, onSwipe }: { p: Profile; top: boolean; onSwipe: (dir: "left" | "right") => void }) {
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const start = useRef<number | null>(null);

  const finish = (dir: "left" | "right") => {
    setLeaving(dir === "right" ? 1 : -1);
    setTimeout(() => onSwipe(dir), 250);
  };

  const x = leaving ? leaving * 600 : dx;
  return (
    <div
      className="absolute inset-0 touch-none select-none overflow-hidden rounded-[var(--radius)] bg-card shadow-card"
      style={{ transform: `translateX(${x}px) rotate(${x / 18}deg)`, transition: start.current === null ? "transform .25s ease-out" : "none", zIndex: top ? 2 : 1, scale: top ? "1" : "0.95" }}
      onPointerDown={(e) => { if (!top) return; start.current = e.clientX; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (start.current !== null) setDx(e.clientX - start.current); }}
      onPointerUp={() => {
        start.current = null;
        if (dx > 100) finish("right"); else if (dx < -100) finish("left"); else setDx(0);
      }}
    >
      <img src={p.img} alt={`${p.name}, ${p.archetype} anime character`} width={768} height={1024} draggable={false} className="h-full w-full object-cover" />
      <div className="bg-shade absolute inset-0" />

      {dx > 30 && <span className="absolute left-5 top-8 -rotate-12 rounded-lg border-4 border-like px-3 py-1 font-display text-3xl text-like">好き LIKE</span>}
      {dx < -30 && <span className="absolute right-5 top-8 rotate-12 rounded-lg border-4 border-nope px-3 py-1 font-display text-3xl text-nope">NOPE</span>}

      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-extrabold text-secondary-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> Sample character • 18+
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-extrabold">
          <Sparkles className="h-3.5 w-3.5" /> {p.match}% soulmate match
        </div>
        <h2 className="font-display text-4xl">
          {p.name} <span className="font-sans text-2xl font-normal">{p.age}</span>
        </h2>
        <p className="ink-shadow mt-1 text-sm font-bold opacity-100">
          {p.archetype}
          {ARCHETYPE_NOTES[p.archetype] && (
            <span className="text-xs font-medium opacity-90"> ({ARCHETYPE_NOTES[p.archetype]})</span>
          )}
        </p>
        <p className="ink-shadow text-xs font-semibold opacity-80"><Tv className="inline h-3.5 w-3.5" /> Watching {p.watching}</p>
        <p className="ink-shadow mt-2 text-sm opacity-90">{p.why}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span key={t} className="ink-shadow rounded-full border border-primary-foreground/40 bg-primary-foreground/15 px-2.5 py-1 text-xs font-bold backdrop-blur">
              {t}
              {TAG_NOTES[t] && <span className="font-medium opacity-75"> ({TAG_NOTES[t]})</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Index() {
  const { user } = useSession();
  const [deck, setDeck] = useState(PROFILES);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [key, setKey] = useState(0);

  const swipe = (dir: "left" | "right") => {
    const [first, ...rest] = deck;
    if (!first) return;
    if (dir === "right" && first.match >= 85) setMatched(first);
    setDeck(rest);
    setKey((k) => k + 1);
  };

  if (user) return <Discovery />;
  return (
    <main className="sakura-sky relative min-h-screen font-sans text-foreground">
      <Petals />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24">
        {/* Top bar */}
        <header className="flex items-center justify-between py-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground"><Link to={user ? '/profile' : '/auth'} aria-label={user ? 'My profile' : 'Sign in'}><User className="h-6 w-6" /></Link></Button>
          <div className="flex items-center gap-1.5">
            <Flame className="h-7 w-7 text-primary" fill="currentColor" />
            <span className="text-brand font-display text-2xl">kamimatch</span>
          </div>
          <Button asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground"><Link to="/messages" aria-label="Messages"><MessageCircle className="h-6 w-6" /></Link></Button>
        </header>

        <nav className="mb-3 flex gap-2">
          <span className="flex-1 rounded-full bg-brand py-2 text-center text-xs font-extrabold text-primary-foreground">Discover</span>
          <Link to="/communities" className="flex-1 rounded-full border-2 border-border bg-card py-2 text-center text-xs font-extrabold text-muted-foreground transition hover:border-primary hover:text-primary">Communities</Link>
          <Link to="/top10" className="flex-1 rounded-full border-2 border-border bg-card py-2 text-center text-xs font-extrabold text-muted-foreground transition hover:border-primary hover:text-primary">Top 10</Link>
        </nav>

        <p className="mb-3 rounded-full bg-secondary px-4 py-1.5 text-center text-xs font-bold text-secondary-foreground">
          ✿ Sample deck · real meetings require ID + selfie approval
        </p>

        {/* Deck */}
        <div className="relative aspect-[3/4] w-full">
          {deck.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[var(--radius)] border-2 border-dashed border-border bg-card/70 p-8 text-center">
              <span className="font-display text-5xl text-primary">桜</span>
              <h2 className="mt-3 font-display text-2xl">That's the sample deck</h2>
              <p className="mt-2 text-sm text-muted-foreground">You've explored the sample characters. Sign in and verify your identity to discover real members.</p>
              <button onClick={() => setDeck(PROFILES)} className="mt-6 rounded-full bg-brand px-6 py-3 font-extrabold text-primary-foreground shadow-card">Pull again</button>
            </div>
          ) : (
            deck.slice(0, 2).reverse().map((p, i, arr) => (
              <SwipeCard key={`${p.name}-${key}`} p={p} top={i === arr.length - 1} onSwipe={swipe} />
            ))
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button aria-label="Rewind" onClick={() => setDeck(PROFILES)} className="grid h-12 w-12 place-items-center rounded-full bg-card text-primary-glow shadow-card transition hover:scale-110"><RotateCcw className="h-5 w-5" /></button>
          <button aria-label="Nope" onClick={() => swipe("left")} className="grid h-16 w-16 place-items-center rounded-full bg-card text-nope shadow-card transition hover:scale-110"><X className="h-8 w-8" strokeWidth={3} /></button>
          <button aria-label="Super like" onClick={() => swipe("right")} className="grid h-12 w-12 place-items-center rounded-full bg-card text-super shadow-card transition hover:scale-110"><Star className="h-5 w-5" fill="currentColor" /></button>
          <button aria-label="Like" onClick={() => swipe("right")} className="grid h-16 w-16 place-items-center rounded-full bg-card text-like shadow-card transition hover:scale-110"><Heart className="h-8 w-8" fill="currentColor" /></button>
        </div>

        <div className="mt-8 text-center">
          <Button asChild className="h-14 w-full rounded-full bg-brand font-extrabold shadow-card"><Link to={user ? '/profile' : '/auth'}>{user ? 'My character & safety check' : 'Create your character'}</Link></Button>
          <p className="mt-3 text-xs text-muted-foreground">You must be 18 or older and verify your identity to use KamiMatch.</p>
        </div>
      </div>

      {/* Match overlay */}
      {matched && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/85 p-6 text-center text-primary-foreground backdrop-blur" onClick={() => setMatched(null)}>
          <p className="pop-in font-display text-6xl text-brand">運命!</p>
          <h2 className="pop-in mt-2 font-display text-4xl">A sample match!</h2>
          <img src={matched.img} alt={matched.name} width={768} height={1024} className="pop-in mt-6 h-40 w-40 rounded-full border-4 border-primary object-cover" />
          <p className="mt-4 max-w-xs text-sm opacity-90">{matched.match}% — you both love:</p>
          <div className="mt-3 flex max-w-xs flex-wrap justify-center gap-1.5">
            {matched.tags.map((t) => (
              <span key={t} className="rounded-full border border-primary-foreground/40 bg-primary-foreground/15 px-2.5 py-1 text-xs font-bold">
                {t}
                {TAG_NOTES[t] && <span className="font-medium opacity-75"> ({TAG_NOTES[t]})</span>}
              </span>
            ))}
          </div>
          <Button asChild className="mt-6 h-12 rounded-full bg-brand px-8 font-extrabold shadow-card"><Link to={user ? '/profile' : '/auth'} onClick={(e) => e.stopPropagation()}>Build my real profile</Link></Button>
          <Button variant="ghost" onClick={() => setMatched(null)} className="mt-3 text-primary-foreground">Keep swiping</Button>
        </div>
      )}
    </main>
  );
}
