CREATE OR REPLACE FUNCTION public.cast_swipe(_target uuid, _choice text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE actor uuid:=auth.uid(); mid uuid; monthly_matches integer;
BEGIN
 IF actor IS NULL OR actor=_target OR _choice NOT IN('like','pass','super') OR NOT public.is_verified(actor) OR NOT public.is_verified(_target) OR public.pair_blocked(actor,_target) THEN RAISE EXCEPTION 'Both members must be identity-approved and unblocked'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(LEAST(actor,_target)::text||GREATEST(actor,_target)::text,0));
 INSERT INTO public.swipes(actor_id,target_id,choice) VALUES(actor,_target,_choice) ON CONFLICT(actor_id,target_id) DO UPDATE SET choice=EXCLUDED.choice,created_at=now();
 IF _choice IN('like','super') AND EXISTS(SELECT 1 FROM public.swipes WHERE actor_id=_target AND target_id=actor AND choice IN('like','super')) THEN
  IF NOT public.is_premium(actor) THEN
   SELECT count(*) INTO monthly_matches FROM public.matches WHERE (user_a=actor OR user_b=actor) AND created_at>=(date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');
   IF monthly_matches>=5 THEN RAISE EXCEPTION 'Free members can match with up to 5 people each month. Your matches reset on the 1st — go Premium for unlimited matches.'; END IF;
  END IF;
  INSERT INTO public.matches(user_a,user_b) VALUES(LEAST(actor,_target),GREATEST(actor,_target)) ON CONFLICT(user_a,user_b) DO NOTHING;
  SELECT id INTO mid FROM public.matches WHERE user_a=LEAST(actor,_target) AND user_b=GREATEST(actor,_target);
 END IF;
 RETURN mid;
END $function$;