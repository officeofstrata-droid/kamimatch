import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Coffee,
  Flame,
  Heart,
  LayoutGrid,
  MapPin,
  Music2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Tv,
  Users,
} from "lucide-react";
import { Petals } from "@/components/Petals";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Communities — WaifuMatch" },
      {
        name: "description",
        content:
          "Watch parties, trope clubs, seasonal buddies and convention companions — find your anime people on WaifuMatch.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Communities — WaifuMatch" },
      {
        property: "og:description",
        content:
          "Watch parties, trope clubs, seasonal buddies and convention companions — find your anime people.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Communities,
});

const ROOMS = [
  {
    title: "Frieren S2 — Ep 9",
    note: "spoiler-safe until everyone's caught up",
    host: "@yuki",
    watching: 14,
    starts: "9:00pm",
    live: false,
  },
  {
    title: "Steins;Gate — Ep 1, again",
    note: "for the fourteenth time. El Psy Kongroo.",
    host: "@okaabe",
    watching: 8,
    starts: "now",
    live: true,
  },
  {
    title: "Yuru Camp comfort loop",
    note: "hot cocoa, zero stakes, bring snacks",
    host: "@momo",
    watching: 22,
    starts: "10:30pm",
    live: false,
  },
];

const CLUBS = [
  { name: "Trope Tribunal", note: "argue about slow burn vs. insta-love", members: "12.4k" },
  { name: "Isekai Support Group", note: "for the truck-kun survivors", members: "8.1k" },
  { name: "Comfort Rewatch Club", note: "same six shows, every winter", members: "19.7k" },
  { name: "Villain Apologists", note: "they weren't wrong, actually", members: "5.6k" },
  { name: "Opening Song Purists", note: "skipping the OP is a crime", members: "3.2k" },
  { name: "Cosplay Crew", note: "find a photographer and a convention buddy", members: "7.9k" },
  { name: "Dub or Sub Truce", note: "agree to disagree, politely", members: "4.4k" },
  { name: "Merch Shelf Flex", note: "post the shelf, get judged kindly", members: "2.8k" },
];

const CONS = ["Anime Expo", "MCM London", "Anime NYC", "PAX Unplugged", "Comiket", "AnimagiC"];

const NICHES = [
  {
    icon: Flame,
    name: "Filler Tolerance dial",
    note: "Match on how much padding you can sit through. Nobody's surprised again.",
  },
  {
    icon: Music2,
    name: "Dub / Sub truce",
    note: "Say it once on your profile instead of fighting about it on date three.",
  },
  {
    icon: ShieldCheck,
    name: "Spoiler Shield",
    note: "Profiles hide endings until you've both watched it. The reveal is the date.",
  },
  {
    icon: CalendarDays,
    name: "Seasonal Buddy",
    note: "One person, one show, one week. You both start Ep 1 on Friday.",
  },
  {
    icon: MapPin,
    name: "Convention Companion",
    note: "Pick a con, meet the people going. Somebody to hold the queue spot.",
  },
  {
    icon: LayoutGrid,
    name: "Watch Party Bingo",
    note: "Fill a card together. First to 'BINGO' picks the next show.",
  },
  {
    icon: Camera,
    name: "Merch Shelf",
    note: "Show the collection. Verified shelves only — no borrowed figurines.",
  },
  {
    icon: Coffee,
    name: "Mood Ring",
    note: "Set tonight's mood — comfort rewatch, hype, sad hours — and match on it.",
  },
  {
    icon: Sparkles,
    name: "Comfort Rewatch badge",
    note: "Prove you've really seen it six times, not just 'it's fine'.",
  },
  {
    icon: Ticket,
    name: "Ship Chart",
    note: "See whether your favourite couples line up before you say a word.",
  },
  {
    icon: Heart,
    name: "Isekai Insurance",
    note: "A badge for anyone absolutely certain truck-kun is coming for them.",
  },
  {
    icon: Users,
    name: "Senpai Detector",
    note: "Only ID-verified adults can message you. No exceptions, no 'trust me'.",
  },
];

function Section({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: typeof Flame;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Communities() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setJoined((j) => ({ ...j, [id]: !j[id] }));

  return (
    <main className="sakura-sky relative min-h-screen font-sans text-foreground">
      <Petals />
      <div className="relative mx-auto max-w-md px-4 pb-24">
        <header className="flex items-center gap-3 py-4">
          <Link
            to="/"
            aria-label="Back to swiping"
            className="rounded-full bg-card p-2 text-muted-foreground shadow-card transition hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl leading-none text-brand">Communities</h1>
            <p className="text-xs font-bold text-secondary-foreground">
              ✿ 18+ only — every member is ID verified
            </p>
          </div>
        </header>

        <Section icon={Tv} title="Watch parties" note="Spoiler-safe rooms. Nobody jumps ahead.">
          <div className="space-y-3">
            {ROOMS.map((r) => (
              <div
                key={r.title}
                className="rounded-[var(--radius)] border-2 border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg leading-tight">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      r.live ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {r.live ? "live" : r.starts}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    <Users className="mr-1 inline h-3.5 w-3.5" />
                    {r.watching} watching · host {r.host}
                  </p>
                  <button
                    onClick={() => toggle(r.title)}
                    className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                      joined[r.title]
                        ? "bg-ink text-primary-foreground"
                        : "bg-brand text-primary-foreground hover:brightness-110"
                    }`}
                  >
                    {joined[r.title] ? "Joined ✿" : "Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Users} title="Clubs" note="Find your people, then find your person.">
          <div className="grid grid-cols-2 gap-3">
            {CLUBS.map((c) => (
              <button
                key={c.name}
                onClick={() => toggle(c.name)}
                className={`rounded-[var(--radius)] border-2 p-3 text-left shadow-card transition ${
                  joined[c.name]
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary"
                }`}
              >
                <p className="font-display text-base leading-tight">{c.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{c.note}</p>
                <p className="mt-2 text-[11px] font-extrabold text-primary">
                  {joined[c.name] ? "Member ✿ " : ""}
                  {c.members}
                </p>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={CalendarDays} title="Seasonal Buddy">
          <div className="rounded-[var(--radius)] border-2 border-border bg-card p-4 shadow-card">
            <p className="text-sm text-foreground">
              We pair you with <strong>one</strong> person watching the <strong>same</strong> new
              season. You both start Episode 1 on Friday, then compare notes every Sunday — no
              spoilers, no pressure.
            </p>
            <button className="mt-3 w-full rounded-full bg-brand py-3 font-extrabold text-primary-foreground transition hover:brightness-110">
              Get my buddy for this season
            </button>
          </div>
        </Section>

        <Section icon={MapPin} title="Convention Companion" note="Somebody for the queue, the hall, the after-café.">
          <div className="flex flex-wrap gap-2">
            {CONS.map((c) => (
              <button
                key={c}
                onClick={() => toggle(`con-${c}`)}
                className={`rounded-full border-2 px-4 py-2 text-xs font-extrabold transition ${
                  joined[`con-${c}`]
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                {joined[`con-${c}`] ? "✿ " : ""}
                {c}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={LayoutGrid} title="Watch Party Bingo" note="Fill a card together. First to shout it picks the next show.">
          <div className="grid grid-cols-3 gap-2 rounded-[var(--radius)] border-2 border-border bg-card p-3 shadow-card">
            {["Crying", "Rival", "Beach ep", "Filler", "FREE", "OP banger", "Plot twist", "Sakura", "Confession"].map(
              (cell) => (
                <span
                  key={cell}
                  className={`grid h-14 place-items-center rounded-xl border-2 text-center text-[11px] font-extrabold ${
                    cell === "FREE"
                      ? "border-transparent bg-brand text-primary-foreground"
                      : "border-dashed border-border text-muted-foreground"
                  }`}
                >
                  {cell}
                </span>
              ),
            )}
          </div>
        </Section>

        <Section icon={Sparkles} title="Only on WaifuMatch" note="The things no other dating app thought of.">
          <div className="space-y-2">
            {NICHES.map((n) => (
              <div
                key={n.name}
                className="flex items-start gap-3 rounded-[var(--radius)] border-2 border-border bg-card p-3 shadow-card"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary">
                  <n.icon className="h-4 w-4 text-secondary-foreground" />
                </span>
                <div>
                  <p className="text-sm font-extrabold leading-tight">{n.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{n.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-10 text-center">
          <Link
            to="/top10"
            className="inline-block w-full rounded-full bg-brand py-4 font-extrabold text-primary-foreground shadow-card transition hover:brightness-110"
          >
            Pick your top 10 anime
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Rooms and clubs open to members once your ID is verified.
          </p>
        </div>
      </div>
    </main>
  );
}
