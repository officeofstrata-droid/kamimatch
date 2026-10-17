import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getVeriffStatus=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const result=await context.supabase.from('verification_sessions').select('status,created_at').eq('user_id',context.userId).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(result.error)throw new Error('Verification status could not be loaded.');
 const verified=await context.supabase.rpc('is_verified',{_user_id:context.userId});
 if(verified.error)throw new Error('Your verification status could not be checked.');
 return {configured:!!(process.env['VERIFF_API_KEY']&&process.env['VERIFF_SHARED_SECRET']&&process.env['VERIFF_BASE_URL']),verified:verified.data===true,session:result.data};
});
export const startVeriff=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({consent:z.literal(true)}).parse(input)).handler(async({context})=>{
 const apiKey=process.env['VERIFF_API_KEY'],secret=process.env['VERIFF_SHARED_SECRET'],base=process.env['VERIFF_BASE_URL'];
 if(!apiKey||!secret||!base)throw new Error('Veriff is not connected yet. Your current private review remains available.');
 const details=await context.supabase.from('account_details').select('birth_date').eq('user_id',context.userId).single();
 if(details.error||!details.data)throw new Error('Complete your adult profile first.');
 const url=new URL(base);if(url.protocol!=='https:'||!url.hostname.endsWith('.veriff.com'))throw new Error('Veriff connection needs a valid service address.');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const pending=await context.supabase.from('verification_sessions').select('status').eq('user_id',context.userId).in('status',['created','pending']).limit(1);
 if(pending.error)throw new Error('Could not check your current verification.');
 if(pending.data?.length)throw new Error('A Veriff check is already in progress. Please finish it or wait for its decision.');
 const record=await supabaseAdmin.from('verification_sessions').insert({user_id:context.userId}).select('id').single();if(record.error||!record.data)throw new Error('Could not start your identity check.');
 try{
 const response=await fetch(`${url.origin}/v1/sessions`,{method:'POST',headers:{'X-AUTH-CLIENT':apiKey,'Content-Type':'application/json'},body:JSON.stringify({verification:{callback:`${new URL(getRequest().url).origin}/verify`,vendorData:record.data.id}})});
 if(!response.ok)throw new Error('Veriff could not start your check. Please check your connection and account.');
 const payload=z.object({verification:z.object({id:z.string().uuid(),url:z.string().url()})}).parse(await response.json());
 const hosted=new URL(payload.verification.url);if(hosted.protocol!=='https:'||!hosted.hostname.endsWith('.veriff.com'))throw new Error('Veriff returned an invalid verification link.');
 const save=await supabaseAdmin.from('verification_sessions').update({provider_session_id:payload.verification.id,status:'pending'}).eq('id',record.data.id).eq('user_id',context.userId);
 if(save.error)throw new Error('Your verification session could not be saved.');return {url:hosted.toString()};
 }catch(e){await supabaseAdmin.from('verification_sessions').update({status:'abandoned'}).eq('id',record.data.id).eq('user_id',context.userId);throw new Error(e instanceof Error?e.message:'Verification could not start.');}
});
