CREATE TABLE public.daily_soulmate_picks (
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 pick_date date NOT NULL DEFAULT (timezone('UTC',now()))::date,
 target_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 PRIMARY KEY(user_id,pick_date)
);
GRANT SELECT ON public.daily_soulmate_picks TO authenticated;
GRANT ALL ON public.daily_soulmate_picks TO service_role;
ALTER TABLE public.daily_soulmate_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_pick_owner ON public.daily_soulmate_picks FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE OR REPLACE FUNCTION public.get_daily_soulmate() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); day date:=(timezone('UTC',now()))::date; target uuid;
BEGIN
 IF actor IS NULL OR NOT public.is_verified(actor) THEN RETURN NULL; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text||day::text,3));
 SELECT target_id INTO target FROM public.daily_soulmate_picks WHERE user_id=actor AND pick_date=day;
 IF NOT FOUND THEN
  SELECT p.id INTO target FROM public.profiles p WHERE p.id<>actor AND public.is_verified(p.id) AND NOT public.pair_blocked(actor,p.id) AND NOT EXISTS(SELECT 1 FROM public.swipes s WHERE s.actor_id=actor AND s.target_id=p.id) ORDER BY md5(actor::text||day::text||p.id::text) LIMIT 1;
  INSERT INTO public.daily_soulmate_picks(user_id,pick_date,target_id) VALUES(actor,day,target);
 END IF;
 IF target IS NULL OR NOT public.is_verified(target) OR public.pair_blocked(actor,target) OR EXISTS(SELECT 1 FROM public.swipes WHERE actor_id=actor AND target_id=target) THEN RETURN NULL; END IF;
 RETURN target;
END $$;
REVOKE ALL ON FUNCTION public.get_daily_soulmate() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_daily_soulmate() TO authenticated,service_role;