CREATE TABLE public.photo_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.photo_reveals TO authenticated;
GRANT ALL ON public.photo_reveals TO service_role;
ALTER TABLE public.photo_reveals ENABLE ROW LEVEL SECURITY;
CREATE POLICY reveals_read ON public.photo_reveals FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.matches m WHERE m.id = match_id AND (m.user_a = auth.uid() OR m.user_b = auth.uid())));
CREATE OR REPLACE FUNCTION public.reserve_reveal(_match_id uuid, _path text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _match public.matches%ROWTYPE;
  _premium boolean;
  _used integer;
  _id uuid;
BEGIN
  SELECT * INTO _match FROM public.matches WHERE id = _match_id AND (user_a = auth.uid() OR user_b = auth.uid());
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This match is not available.';
  END IF;
  IF NOT public.is_verified(auth.uid()) THEN
    RAISE EXCEPTION 'Identity approval is required before revealing a real photo.';
  END IF;
  SELECT public.is_premium(auth.uid()) INTO _premium;
  IF NOT _premium THEN
    SELECT count(*) INTO _used FROM public.photo_reveals
      WHERE owner_id = auth.uid() AND created_at >= date_trunc('month', now());
    IF _used >= 2 THEN
      RAISE EXCEPTION 'Free members can reveal a real photo twice a month. Premium removes the limit.';
    END IF;
  END IF;
  INSERT INTO public.photo_reveals (match_id, owner_id, path) VALUES (_match_id, auth.uid(), _path) RETURNING id INTO _id;
  RETURN _id;
END $$;