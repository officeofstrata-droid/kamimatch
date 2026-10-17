import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { ageOn, canReview, preferencesSchema, profileSchema } from '@/lib/account-rules';

export const getAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabase, userId } = context;
  const [profile, details, identity, preferences, role] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('account_details').select('birth_date').eq('user_id', userId).maybeSingle(),
    supabase.from('identity_submissions').select('id,status,reviewer_note,submitted_at').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('anime_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
  ]);
  for (const result of [profile, details, identity, preferences, role]) if (result.error) throw new Error('Your account could not be loaded. Please try again.');
  return { profile: profile.data, details: details.data, identity: identity.data, preferences: preferences.data, isAdmin: role.data === true, userId };
});

export const saveProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input) => profileSchema.parse(input)).handler(async ({ data, context }) => {
  const { birth_date, consent: _consent, ...profile } = data;
  const existing = await context.supabase.from('account_details').select('birth_date').eq('user_id', context.userId).maybeSingle();
  if (existing.error) throw new Error('Could not check your date of birth.');
  if (existing.data && existing.data.birth_date !== birth_date) throw new Error('Your date of birth cannot be changed after onboarding.');
  const result = await context.supabase.from('profiles').upsert({ ...profile, id: context.userId, age: ageOn(birth_date) });
  if (result.error) throw new Error('Your profile could not be saved.');
  if (!existing.data) {
    const details = await context.supabase.from('account_details').insert({ user_id: context.userId, birth_date });
    if (details.error) throw new Error('Your age check could not be saved. Please retry.');
  }
  return { ok: true };
});

export const savePreferences = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input) => preferencesSchema.parse(input)).handler(async ({ data, context }) => {
  const result = await context.supabase.from('anime_preferences').upsert({ user_id: context.userId, ...data.picked, filler: data.filler, dub: data.dub, rewatch: data.rewatch, mood: data.mood, updated_at: new Date().toISOString() });
  if (result.error) throw new Error('Save your profile first, then try saving your favourites again.');
  return { ok: true };
});

export const submitIdentity = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ id_path: z.string().max(300), selfie_path: z.string().max(300) }).parse(input)).handler(async ({ data, context }) => {
  if (!data.id_path.startsWith(`${context.userId}/`) || !data.selfie_path.startsWith(`${context.userId}/`)) throw new Error('These files do not belong to your account.');
  const result = await context.supabase.from('identity_submissions').insert({ ...data, user_id: context.userId });
  if (result.error) throw new Error('Could not submit your check. Make sure both files uploaded and no check is already pending.');
  return { ok: true };
});

export const getReviewQueue = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Only an authorised reviewer can open this page.');
  const rows = await context.supabase.from('identity_submissions').select('*').eq('status', 'pending').order('submitted_at').limit(50);
  if (rows.error) throw new Error('The review queue could not be loaded.');
  const submissions = await Promise.all((rows.data ?? []).map(async (row) => {
    const [profile, details, id, selfie] = await Promise.all([
      context.supabase.from('profiles').select('display_name,age').eq('id', row.user_id).maybeSingle(),
      context.supabase.from('account_details').select('birth_date').eq('user_id', row.user_id).maybeSingle(),
      context.supabase.storage.from('identity-checks').createSignedUrl(row.id_path, 120),
      context.supabase.storage.from('identity-checks').createSignedUrl(row.selfie_path, 120),
    ]);
    return { id: row.id, user_id: row.user_id, name: profile.data?.display_name ?? 'Member', age: profile.data?.age, birthDate: details.data?.birth_date, idUrl: id.data?.signedUrl, selfieUrl: selfie.data?.signedUrl, submittedAt: row.submitted_at };
  }));
  return { submissions, reviewerId: context.userId };
});

export const reviewIdentity = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(['approved', 'rejected']), note: z.string().trim().max(500) }).parse(input)).handler(async ({ data, context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  const row = await context.supabase.from('identity_submissions').select('user_id').eq('id', data.id).eq('status', 'pending').maybeSingle();
  if (role.error || row.error || !row.data || !canReview(role.data === true, context.userId, row.data.user_id)) throw new Error('You cannot review this submission.');
  if (data.status === 'rejected' && !data.note) throw new Error('Please explain what the member needs to correct.');
  const result = await context.supabase.from('identity_submissions').update({ status: data.status, reviewer_note: data.note, reviewed_at: new Date().toISOString(), reviewed_by: context.userId }).eq('id', data.id).eq('status', 'pending').select('id').single();
  if (result.error) throw new Error('The decision could not be saved.');
  return { ok: true };
});