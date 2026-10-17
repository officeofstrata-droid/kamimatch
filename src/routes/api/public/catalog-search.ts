import { createFileRoute } from "@tanstack/react-router";

// Public, read-only proxy over the AniList catalog.
// Only a search term leaves the app; nothing user-specific is read or returned.
const ANILIST = "https://graphql.anilist.co";

type Hit = { id: string; title: string; sub?: string | undefined; image?: string | undefined };

const QUERY: Record<"anime" | "characters", string> = {
  anime: `query($s:String){Page(perPage:14){media(search:$s,type:ANIME,sort:POPULARITY_DESC){
    id title{romaji english} format seasonYear coverImage{medium}}}}`,
  characters: `query($s:String){Page(perPage:14){characters(search:$s,sort:FAVOURITES_DESC){
    id name{full native} image{medium}}}}`,
};

export const Route = createFileRoute("/api/public/catalog-search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = (url.searchParams.get("q") ?? "").trim().slice(0, 60);
        const kind = url.searchParams.get("kind") === "characters" ? "characters" : "anime";

        if (q.length < 2) return Response.json({ results: [] as Hit[] });

        try {
          const res = await fetch(ANILIST, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "WaifuMatch/1.0 (anime profile picker)",
            },
            body: JSON.stringify({ query: QUERY[kind], variables: { s: q } }),
            signal: AbortSignal.timeout(9000),
          });
          if (!res.ok) return Response.json({ results: [] as Hit[] });

          const json: any = await res.json();
          const rows: any[] = json?.data?.Page?.[kind === "anime" ? "media" : "characters"] ?? [];

          const results: Hit[] = rows
            .map((row): Hit | null => {
              if (kind === "characters") {
                const title = row?.name?.full || row?.name?.native;
                if (!title) return null;
                return {
                  id: `c-${row?.id ?? title}`,
                  title: String(title),
                  sub: row?.name?.native && row?.name?.full ? String(row.name.native) : undefined,
                  image: row?.image?.medium,
                };
              }
              const title = row?.title?.english || row?.title?.romaji;
              if (!title) return null;
              const sub = [row?.format, row?.seasonYear].filter(Boolean).join(" • ");
              return {
                id: `a-${row?.id ?? title}`,
                title: String(title),
                sub: sub || undefined,
                image: row?.coverImage?.medium,
              };
            })
            .filter((h): h is Hit => Boolean(h));

          return Response.json(
            { results },
            { headers: { "Cache-Control": "public, max-age=600" } },
          );
        } catch {
          return Response.json({ results: [] as Hit[] });
        }
      },
    },
  },
});
