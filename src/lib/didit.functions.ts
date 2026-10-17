import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { diditHostedUrl } from '@/lib/didit-rules';
export const getDiditStatus=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const result=await context.supabase.from('verification_sessions').select('status,created_at,hosted_url').eq('user_id',context.userId).eq('provider','didit').order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(result.error)throw new Error('Verification status could not be loaded.');
 const verified=await context.supabase.rpc('is_verified',{_user_id:context.userId});if(verified.error)throw new Error('Your verification status could not be checked.');
 return {configured:!!(process.env['DIDIT_API_KEY']&&process.env['DIDIT_WEBHOOK_SECRET']&&process.env['DIDIT_WORKFLOW_ID']),verified:verified.data===true,session:result.data};
});
export const startDidit=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({consent:z.literal(true)}).parse(input)).handler(async({context})=>{
 const apiKey=process.env['DIDIT_API_KEY'],secret=process.env['DIDIT_WEBHOOK_SECRET'],workflow=process.env['DIDIT_WORKFLOW_ID'];
 if(!apiKey||!secret||!workflow)throw new Error('Didit is not connected yet. Your current private review remains available.');
 if(!z.string().uuid().safeParse(workflow).success)throw new Error('Didit needs a valid verification workflow.');
 const details=await context.supabase.from('account_details').select('birth_date').eq('user_id',context.userId).single();if(details.error||!details.data)throw new Error('Complete your adult profile first.');
 const pending=await context.supabase.from('verification_sessions').select('status,hosted_url').eq('user_id',context.userId).eq('provider','didit').in('status',['created','pending']).limit(1).maybeSingle();
 if(pending.error)throw new Error('Could not check your current verification.');
 if(pending.data?.hosted_url)return {url:diditHostedUrl(pending.data.hosted_url)};
 if(pending.data)throw new Error('Your check is starting. Please try again shortly.');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const record=await supabaseAdmin.from('verification_sessions').insert({user_id:context.userId,provider:'didit',workflow_id:workflow}).select('id').single();if(record.error||!record.data)throw new Error('Could not start your identity check.');
 try{
 const response=await fetch('https://verification.didit.me/v3/session/',{method:'POST',headers:{'x-api-key':apiKey,'Content-Type':'application/json'},body:JSON.stringify({workflow_id:workflow,vendor_data:record.data.id,callback:`${new URL(getRequest().url).origin}/verify`,callback_method:'both',expected_details:{date_of_birth:details.data.birth_date}})});
 if(!response.ok)throw new Error(`Didit could not start your check (${response.status}). Check your Didit account configuration.`);
 const payload=z.object({session_id:z.string().uuid(),url:z.string().url()}).parse(await response.json());const hosted=diditHostedUrl(payload.url);
 const save=await supabaseAdmin.from('verification_sessions').update({provider_session_id:payload.session_id,hosted_url:hosted,status:'pending'}).eq('id',record.data.id).eq('user_id',context.userId);
 if(save.error)throw new Error('Your verification session could not be saved.');return {url:hosted};
 }catch(e){await supabaseAdmin.from('verification_sessions').update({status:'abandoned'}).eq('id',record.data.id).eq('user_id',context.userId);throw new Error(e instanceof Error?e.message:'Verification could not start.');}
});
