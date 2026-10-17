import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Heart, Search, Sparkles, Users, X, Zap } from "lucide-react";
import { FILLER_LABELS, MOODS, MOVES, SEED_ANIME, SEED_CHARACTERS } from "@/lib/catalog";
import { Petals } from "@/components/Petals";

export const Route = createFileRoute("/top10")({
  head: () => ({
    meta: [
      { title: "Top 10 — WaifuMatch" },
      {
        name: "description",
        content:
          "Build your top 10 anime, characters and signature moves, then set your filler tolerance, dub-or-sub and mood — your Anime DNA.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Top 10 — WaifuMatch" },
      {
        property: "og:description",
        content:
          "Build your top 10 anime, characters and signature moves, then set your filler tolerance, dub-or-sub and mood.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Top10,
});

type Tab = "anime" | "characters" | "moves";
type Hit = { id: string; title: string; sub?: string; image?: string };

const MAX = 10;
const TABS: { id: Tab; label: string; icon: typeof Heart }[] = [
  { id: "anime", label: "Anime", icon: Sparkles },
  { id: "characters", label: "Characters", icon: Users },
  { id: "moves", label: "Moves", icon: Zap },
];

const toHits = (list: string[]): Hit[] => list.map((t) => ({ id: t, title: t }));

function Top10() {
  const [tab, setTab] = useState<Tab>("anime");
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>(() => toHits(SEED_ANIME));
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<Record<Tab, string[]>>({ anime: [], characters: [], moves: [] });
  const [filler, setFiller] = useState(3);
  const [dub, setDub] = useState<"sub" | "dub" | "both">("sub");
  const [rewatch, setRewatch] = useState(2);
  const [mood, setMood] = useState(MOODS[0]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wm-top10");
      if (raw) {
        const data = JSON.parse(raw);
        if (data.picked) setPicked((p) => ({ ...p, ...data.picked }));
        if (typeof data.filler === "number") setFiller(data.filler);
        if (data.dub) setDub(data.dub);
        if (typeof data.rewatch === "number") setRewatch(data.rewatch);
        if (data.mood) setMood(data.mood);
      }
    } catch {
      /* first visit */
    }
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (tab === "moves") {
      setBusy(false);
      setHits(
        toHits(MOVES.filter((m) => m.toLowerCase().includes(term.toLowerCase()))),
      );
      return;
    }
    if (term.length < 2) {
      setBusy(false);
      setHits(toHits(tab === "anime" ? SEED_ANIME : SEED_CHARACTERS));
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch(
          `/api/public/catalog-search?kind=${tab}&q=${encodeURIComponent(term)}`,
          { signal: ctrl.signal },
        );
        const json = await res.json();
        setHits(Array.isArray(json.results) ? json.results : []);
      } catch {
        /* keep the current list */
      } finally {
        setBusy(false);
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, tab]);

  const chosen = picked[tab];
  const full = chosen.length >= MAX;

  const toggle = (id: string, title: string) => {
    setSaved(false);
    setPicked((prev) => {
      const cur = prev[tab];
      if (cur.includes(id)) return { ...prev, [tab]: cur.filter((x) => x !== id) };
      if (cur.length >= MAX) return prev;
      return { ...prev, [tab]: [...cur, `${title}`] };
    });
  };

  const isChosen = (id: string, title: string) => chosen.includes(title) || chosen.includes(id);

  const save = () => {
    localStorage.setItem("wm-top10", JSON.stringify({ picked, filler, dub, rewatch, mood }));
    setSaved(true);
  };

  return (
    <main className="sakura-sky relative min-h-screen font-sans text-foreground">
      <Petals />
      <div className="relative mx-auto max-w-md px-4 pb-28">
        <header className="flex items-center gap-3 py-4">
          <Link
            to="/"
            aria-label="Back to swiping"
            className="rounded-full bg-card p-2 text-muted-foreground shadow-card transition hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl leading-none text-brand">Anime DNA</h1>
            <p className="text-xs font-bold text-secondary-foreground">
              Your top 10 — anime, characters and moves
            </p>
          </div>
        </header>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setQ("");
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border-2 px-3 py-2 text-xs font-extrabold transition ${
                tab === t.id
                  ? "border-transparent bg-brand text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <p className="mt-4 flex items-center justify-between font-display text-xl">
          <span>
            {chosen.length}
            <span className="text-muted-foreground">/{MAX}</span> {tab}
          </span>
          {full && <span className="text-xs font-bold text-primary">full — remove one to swap</span>}
        </p>

        <label className="mt-2 flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-3 shadow-card">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              tab === "anime"
                ? "Search any anime ever made…"
                : tab === "characters"
                  ? "Search any character…"
                  : "Search moves — 'head pat', 'confession'…"
            }
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {busy && <span className="text-xs font-bold text-primary">…</span>}
        </label>

        {chosen.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chosen.map((c) => (
              <button
                key={c}
                onClick={() => toggle(c, c)}
                className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                {c} <X className="ml-1 inline h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 space-y-2">
          {hits.length === 0 && (
            <p className="rounded-[var(--radius)] border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nothing matched — try a shorter search.
            </p>
          )}
          {hits.map((h) => {
            const on = isChosen(h.id, h.title);
            return (
              <button
                key={h.id}
                onClick={() => toggle(h.id, h.title)}
                disabled={!on && full}
                className={`flex w-full items-center gap-3 rounded-[var(--radius)] border-2 bg-card p-2.5 text-left shadow-card transition ${
                  on ? "border-primary bg-primary/10" : "border-border hover:border-primary"
                } ${!on && full ? "opacity-40" : ""}`}
              >
                {h.image ? (
                  <img
                    src={h.image}
                    alt=""
                    loading="lazy"
                    className="h-12 w-9 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span className="grid h-12 w-9 shrink-0 place-items-center rounded-md bg-secondary font-display text-sm text-secondary-foreground">
                    ✿
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold">{h.title}</span>
                  {h.sub && <span className="block truncate text-[11px] text-muted-foreground">{h.sub}</span>}
                </span>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    on ? "bg-brand text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="text-xs font-extrabold">+</span>}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-8 rounded-[var(--radius)] border-2 border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-2xl">Compatibility dials</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The numbers other apps never ask about.
          </p>

          <div className="mt-4 space-y-5">
            <div>
              <p className="text-sm font-extrabold">
                Filler tolerance: <span className="text-primary">{FILLER_LABELS[filler - 1]}</span>
              </p>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={filler}
                onChange={(e) => setFiller(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            <div>
              <p className="text-sm font-extrabold">Sub or dub</p>
              <div className="mt-2 flex gap-2">
                {(["sub", "dub", "both"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDub(d)}
                    className={`flex-1 rounded-full border-2 py-2 text-xs font-extrabold uppercase transition ${
                      dub === d
                        ? "border-transparent bg-brand text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-extrabold">
                Rewatch ratio:{" "}
                <span className="text-primary">
                  {["only new stuff", "occasional rewatch", "one comfort show, forever", "everything, twice", "I've memorised the audio"][rewatch - 1]}
                </span>
              </p>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={rewatch}
                onChange={(e) => setRewatch(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            <div>
              <p className="text-sm font-extrabold">Tonight's mood</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                      mood === m
                        ? "border-transparent bg-brand text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={save}
          className="mt-6 w-full rounded-full bg-brand py-4 font-extrabold text-primary-foreground shadow-card transition hover:brightness-110"
        >
          {saved ? "Saved ✿ looks like you" : "Save my Anime DNA"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Kept on this device for now — it moves to your profile the moment accounts go live.
        </p>
      </div>
    </main>
  );
}
