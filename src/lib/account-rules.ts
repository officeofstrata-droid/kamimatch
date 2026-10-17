import { z } from 'zod';

export function ageOn(birthDate: string, today = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return -1;
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(40),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bio: z.string().trim().max(500), city: z.string().trim().max(80),
  archetype: z.string().max(150), watching: z.string().max(100),
  avatar: z.enum(['aiko', 'ren', 'kai']), consent: z.literal(true),
}).superRefine((data, ctx) => {
  const age = ageOn(data.birth_date);
  if (age < 18 || age > 120) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['birth_date'], message: 'You must be at least 18 years old.' });
});

export const preferencesSchema = z.object({
  picked: z.object({ anime: z.array(z.string().max(200)).max(10), characters: z.array(z.string().max(200)).max(10), moves: z.array(z.string().max(200)).max(10) }),
  filler: z.number().int().min(1).max(5), dub: z.enum(['sub', 'dub', 'both']),
  rewatch: z.number().int().min(1).max(5), mood: z.string().max(150),
});

export function canMeet(status: string | null | undefined): boolean { return status === 'approved'; }

export function canReview(isAdmin: boolean, reviewerId: string, ownerId: string): boolean { return isAdmin && reviewerId !== ownerId; }