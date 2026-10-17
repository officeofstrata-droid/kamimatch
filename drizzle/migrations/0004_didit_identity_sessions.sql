ALTER TABLE public.verification_sessions DROP CONSTRAINT verification_sessions_provider_check;
ALTER TABLE public.verification_sessions ADD CONSTRAINT verification_sessions_provider_check CHECK(provider IN ('veriff','didit'));
ALTER TABLE public.verification_sessions ADD COLUMN IF NOT EXISTS hosted_url text;
ALTER TABLE public.verification_sessions ADD COLUMN IF NOT EXISTS workflow_id uuid;
ALTER TABLE public.verification_sessions ADD COLUMN IF NOT EXISTS last_event_id uuid;
COMMENT ON TABLE public.verification_sessions IS 'Private provider session bindings; Veriff integration retired in favour of Didit. Only trusted signed live decisions may approve.';
CREATE UNIQUE INDEX verification_one_active_provider ON public.verification_sessions(user_id,provider) WHERE status IN ('created','pending');