import { z } from 'zod';

export const roomSchema = z.object({
  title: z.string().trim().min(3).max(100),
  anime: z.string().trim().min(1).max(150),
  kind: z.enum(['watch', 'club', 'seasonal', 'convention']),
  episode: z.number().int().min(1).max(10000),
  streaming_url: z.string().max(500).refine(url => url === '' || /^https:\/\/(www\.)?(crunchyroll\.com|netflix\.com|youtube\.com|youtu\.be|hidive\.com)(\/|$)/i.test(url), 'Use an official streaming link, not a download or pirated stream.'),
  starts_at: z.preprocess(value => value === '' ? undefined : value, z.string().datetime({ offset: true }).optional()),
});

export function roomStartTime(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Choose a valid start time.');
  return date.toISOString();
}