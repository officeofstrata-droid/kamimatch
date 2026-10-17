export type Taste = { anime: string[]; characters: string[]; moves: string[]; filler: number; dub: string; rewatch: number; mood: string };
export function compatibility(a: Taste | null, b: Taste | null) {
 if (!a || !b) return { score: 0, shared: [] as string[], reasons: ['Add your favourites to compare taste'] };
 const shared = a.anime.filter(x => b.anime.includes(x));
 const characters = a.characters.filter(x => b.characters.includes(x));
 const moves = a.moves.filter(x => b.moves.includes(x));
 const reasons = [...shared.map(x=>`Both love ${x}`), ...(a.dub === b.dub ? ['Same subtitles / voice preference'] : []), ...(a.mood === b.mood ? ['Same watching mood'] : [])];
 const score = Math.min(100, Math.round(40 * shared.length / Math.max(1, Math.min(a.anime.length,b.anime.length)) + 15 * characters.length / Math.max(1,Math.min(a.characters.length,b.characters.length)) + 15 * moves.length / Math.max(1,Math.min(a.moves.length,b.moves.length)) + (a.dub===b.dub?10:0) + (a.mood===b.mood?10:0) + (5-Math.abs(a.filler-b.filler)) + (5-Math.abs(a.rewatch-b.rewatch))));
 return { score, shared, reasons };
}
