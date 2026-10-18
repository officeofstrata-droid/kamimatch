import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { ageOn, preferencesSchema, profileSchema } from '@/lib/account-rules';

export const getAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabase, userId } = context;
  const [profile, details, identity, preferences, role, verified] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('account_details').select('birth_date').eq('user_id', userId).maybeSingle(),
    supabase.from('verification_sessions').select('status,created_at').eq('user_id', userId).eq('provider', 'didit').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('anime_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
    supabase.rpc('is_verified', { _user_id: userId }),
  ]);
  for (const result of [profile, details, identity, preferences, role, verified]) if (result.error) throw new Error('Your account could not be loaded. Please try again.');
  return { profile: profile.data, details: details.data, identity: identity.data, preferences: preferences.data, isAdmin: role.data === true, verified: verified.data === true, userId };
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

