import { createFileRoute } from '@tanstack/react-router';
import { Check, Crown } from 'lucide-react';
import { AccountShell } from '@/components/AccountShell';
import { FREE_FEATURES, PREMIUM_FEATURES, PREMIUM_MONTHLY_GBP } from '@/lib/plans';
import { getMedia } from '@/lib/media.functions';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PaymentTestModeBanner } from '@/components/PaymentTestModeBanner';
import { StripeEmbeddedCheckout } from '@/components/StripeEmbeddedCheckout';
import { confirmCheckout, createCheckoutSession, createPortalSession, getBilling } from '@/lib/payments.functions';
import { getStripeEnvironment } from '@/lib/stripe';
const options=queryOptions({queryKey:['premium'],queryFn:()=>getMedia()});
export const Route=createFileRoute('/_authenticated/premium')({validateSearch:(search:Record<string,unknown>):{session_id?:string}=>typeof search['session_id']==='string'&&/^cs_[a-zA-Z0-9_]+$/.test(search['session_id'])?{session_id:search['session_id']}:{},loader:({context})=>context.queryClient.ensureQueryData(options),head:()=>({meta:[{title:'Free & Premium — WaifuMatch'},{name:'description',content:'Core dating stays free. Compare anime portraits, videos and premium extras.'},{property:'og:title',content:'Free & Premium — WaifuMatch'},{property:'og:description',content:'Generous free dating and optional premium extras.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'},{name:'robots',content:'noindex, nofollow'}]}),component:Premium});
function Premium(){
 const {data}=useSuspenseQuery(options);
 const {session_id:sessionId}=Route.useSearch();
 const queryClient=useQueryClient();
 const [clientSecret,setClientSecret]=useState<string>();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const token=import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
 const environment=token?.startsWith('pk_test_')?'sandbox':token?.startsWith('pk_live_')?'live':undefined;
 const billing=useQuery({queryKey:['billing',environment],enabled:!!environment,queryFn:()=>getBilling({data:{environment:getStripeEnvironment()}}),refetchInterval:clientSecret||sessionId?5000:false});
 useEffect(()=>{
  if(!sessionId||!environment)return;
  let active=true;
  confirmCheckout({data:{sessionId,environment}}).then(result=>{
   if(!active)return;
   if('error' in result){setError(result.error??'Payment could not be checked.');return;}
   setNotice(result.pending?'Payment is processing. Premium activates after payment clears.':environment==='sandbox'?'Test subscription confirmed. Live Premium access is unchanged.':'Payment confirmed. Premium is active.');
   void queryClient.invalidateQueries();
  }).catch(()=>{if(active)setError('Payment confirmation could not be checked. Please try again.');});
  return()=>{active=false;};
 },[sessionId,environment,queryClient]);
 async function checkout(){setBusy(true);setError('');try{const result=await createCheckoutSession({data:{environment:getStripeEnvironment()}});if('error'in result)throw new Error(result.error);setClientSecret(result.clientSecret);}catch(e){setError(e instanceof Error?e.message:'Checkout could not open.');}finally{setBusy(false);}}
 async function manage(){setBusy(true);setError('');const tab=window.open('about:blank','_blank');try{const result=await createPortalSession({data:{environment:getStripeEnvironment()}});if('error'in result)throw new Error(result.error);if(tab){tab.opener=null;tab.location.href=result.url;}else throw new Error('Allow pop-up windows to manage your subscription.');}catch(e){tab?.close();setError(e instanceof Error?e.message:'Subscription settings could not open.');}finally{setBusy(false);}}
 const subscription=billing.data?.subscription;
 return <><PaymentTestModeBanner/><AccountShell title="More magic, not more pressure"><div className="flex items-center gap-2 text-primary"><Crown/><p className="font-bold">{data.premium?'Premium active':billing.data?.active&&environment==='sandbox'?'Test Premium subscription active':'Your plan: Free'}</p></div>
 {notice&&<p role="status" className="mt-4 text-sm">{notice}</p>}
 {(error||billing.error)&&<p role="alert" className="mt-4 text-sm text-destructive">{error||billing.error?.message}</p>}
 {subscription?.cancel_at_period_end&&subscription.current_period_end&&<p className="mt-4 text-sm">Premium ends on {new Date(subscription.current_period_end).toLocaleDateString('en-GB')}.</p>}
 {subscription?.status==='past_due'&&<p role="status" className="mt-4 text-sm text-destructive">Your renewal payment needs attention. Premium remains available during payment retries.</p>}
 <section className="mt-6"><h2 className="font-display text-2xl">Free · £0</h2><ul className="mt-4 space-y-3">{FREE_FEATURES.map(x=><li key={x} className="flex gap-2 text-sm"><Check className="h-4 w-4 shrink-0 text-primary"/>{x}</li>)}</ul></section>
 <section className="mt-8 border-t border-border pt-6"><h2 className="font-display text-2xl">Premium · £{PREMIUM_MONTHLY_GBP.toFixed(2)} / month</h2><p className="mt-2 text-sm text-muted-foreground">Tax included. Renews monthly. Cancel anytime; keep access until your paid month ends. Identity approval is still required for dating and videos.</p><ul className="mt-4 space-y-3">{PREMIUM_FEATURES.map(x=><li key={x} className="flex gap-2 text-sm"><Crown className="h-4 w-4 shrink-0 text-primary"/>{x}</li>)}</ul>
 {subscription&&<Button className="mt-6 w-full" variant="outline" disabled={busy} onClick={manage}><Crown/>Manage subscription</Button>}
 {!billing.data?.active&&!clientSecret&&<Button className="mt-6 w-full" disabled={busy||!environment||billing.isPending} onClick={checkout}><Crown/>{busy?'Opening checkout…':environment==='sandbox'?'Try Premium · test payment':'Get Premium · £7.99 / month'}</Button>}
 </section></AccountShell>{clientSecret&&<section aria-label="Premium checkout" className="relative mx-auto w-full max-w-3xl px-3 pb-12"><Button variant="ghost" onClick={()=>setClientSecret(undefined)} className="mb-4">Close checkout</Button><StripeEmbeddedCheckout clientSecret={clientSecret}/></section>}</>;
}
