import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountShell } from "@/components/AccountShell";
import { CommunityRooms } from "@/components/CommunityRooms";
import { Button } from "@/components/ui/button";
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
      { title: "Communities — KamiMatch" },
      {
        name: "description",
        content:
          "Watch parties, trope clubs, seasonal buddies and convention companions — find your anime people on KamiMatch.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Communities — KamiMatch" },
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

function Communities() {
 return <AccountShell title="Anime communities" subtitle="Watch parties, clubs, and people who share your favourites."><CommunityRooms /><Button asChild variant="outline" className="mt-8 w-full rounded-full"><Link to="/top10">Choose your top 10</Link></Button></AccountShell>;
}
