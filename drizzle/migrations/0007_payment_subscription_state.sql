CREATE TABLE public.payment_subscriptions (
 provider_subscription_id text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 environment text NOT NULL,
 provider_customer_id text NOT NULL,
 price_id text NOT NULL,
 status text NOT NULL,
 current_period_end timestamptz,
 cancel_at_period_end boolean NOT NULL DEFAULT false,
 event_created bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT payment_environment CHECK(environment IN ('sandbox','live'))
);
GRANT SELECT ON public.payment_subscriptions TO authenticated;
GRANT ALL ON public.payment_subscriptions TO service_role;
ALTER TABLE public.payment_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_owner_read ON public.payment_subscriptions FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE INDEX payment_owner_environment ON public.payment_subscriptions(user_id,environment);
CREATE OR REPLACE FUNCTION public.sync_payment_subscription(_id text,_user uuid,_env text,_customer text,_price text,_status text,_end timestamptz,_cancel boolean,_event_created bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE entitlement public.payment_subscriptions;
BEGIN
 IF _env NOT IN ('sandbox','live') OR _price <> 'waifumatch_premium_monthly' THEN RAISE EXCEPTION 'Invalid payment subscription'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(_user::text||_env,4));
 INSERT INTO public.payment_subscriptions(provider_subscription_id,user_id,environment,provider_customer_id,price_id,status,current_period_end,cancel_at_period_end,event_created)
 VALUES(_id,_user,_env,_customer,_price,_status,_end,_cancel,_event_created)
 ON CONFLICT(provider_subscription_id) DO UPDATE SET status=EXCLUDED.status,current_period_end=EXCLUDED.current_period_end,cancel_at_period_end=EXCLUDED.cancel_at_period_end,event_created=EXCLUDED.event_created,updated_at=now()
 WHERE payment_subscriptions.user_id=EXCLUDED.user_id AND payment_subscriptions.environment=EXCLUDED.environment AND payment_subscriptions.event_created<=EXCLUDED.event_created;
 IF _env='live' THEN
  SELECT * INTO entitlement FROM public.payment_subscriptions WHERE user_id=_user AND environment='live' AND price_id='waifumatch_premium_monthly' AND status IN ('active','trialing','past_due','canceled') AND current_period_end>now() ORDER BY current_period_end DESC LIMIT 1;
  IF FOUND THEN
   INSERT INTO public.subscriptions(user_id,status,current_period_end,provider_customer_id,provider_subscription_id) VALUES(_user,'active',entitlement.current_period_end,entitlement.provider_customer_id,entitlement.provider_subscription_id)
   ON CONFLICT(user_id) DO UPDATE SET status=EXCLUDED.status,current_period_end=EXCLUDED.current_period_end,provider_customer_id=EXCLUDED.provider_customer_id,provider_subscription_id=EXCLUDED.provider_subscription_id;
  ELSE
   INSERT INTO public.subscriptions(user_id,status,current_period_end,provider_customer_id,provider_subscription_id) VALUES(_user,'inactive',_end,_customer,_id)
   ON CONFLICT(user_id) DO UPDATE SET status='inactive',current_period_end=EXCLUDED.current_period_end,provider_customer_id=EXCLUDED.provider_customer_id,provider_subscription_id=EXCLUDED.provider_subscription_id;
  END IF;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.sync_payment_subscription(text,uuid,text,text,text,text,timestamptz,boolean,bigint) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sync_payment_subscription(text,uuid,text,text,text,text,timestamptz,boolean,bigint) TO service_role;