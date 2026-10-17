import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { authenticVeriffSignature, veriffAdultApproved } from '@/lib/veriff-rules';
const dob=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional();
const decision=z.object({verification:z.object({id:z.string().uuid(),status:z.enum(['approved','declined','resubmission_requested','expired','abandoned','review']),code:z.number().optional(),decisionTime:z.string().datetime({offset:true}),document:z.object({dateOfBirth:dob}).nullable().optional(),person:z.object({dateOfBirth:dob}).nullable().optional()})});
export const Route=createFileRoute('/api/public/veriff-webhook')({server:{handlers:{POST:async({request})=>{
 const secret=process.env['VERIFF_SHARED_SECRET'],key=process.env['VERIFF_API_KEY'];
 if(!secret||!key)return new Response('Verification service not configured',{status:503});
 if(request.headers.get('x-auth-client')!==key)return new Response('Unauthorized',{status:401});
 if(Number(request.headers.get('content-length')??0)>200000)return new Response('Payload too large',{status:413});
 const raw=await request.text();if(raw.length>200000)return new Response('Payload too large',{status:413});
 if(!await authenticVeriffSignature(raw,request.headers.get('x-hmac-signature'),secret))return new Response('Unauthorized',{status:401});
 let input:unknown;try{input=JSON.parse(raw);}catch{return new Response('Invalid payload',{status:400});}
 const parsed=decision.safeParse(input);if(!parsed.success)return new Response('Unsupported decision',{status:422});const value=parsed.data.verification;
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const session=await supabaseAdmin.from('verification_sessions').select('id,user_id,decision_at').eq('provider_session_id',value.id).maybeSingle();
 if(session.error)return new Response('Try later',{status:503});if(!session.data)return new Response('Unknown session',{status:404});
 if(session.data.decision_at&&new Date(session.data.decision_at)>=new Date(value.decisionTime))return Response.json({ok:true});
 const details=await supabaseAdmin.from('account_details').select('birth_date').eq('user_id',session.data.user_id).single();if(details.error||!details.data)return new Response('Profile unavailable',{status:409});
 const approved=veriffAdultApproved(value.status,value.code,value.document?.dateOfBirth,value.person?.dateOfBirth,details.data.birth_date);
 const status=value.status==='approved'&&!approved?'review':value.status;
 let update=supabaseAdmin.from('verification_sessions').update({status,verified_birth_date:approved?details.data.birth_date:null,decision_at:value.decisionTime}).eq('id',session.data.id);
 update=session.data.decision_at?update.eq('decision_at',session.data.decision_at):update.is('decision_at',null);
 const saved=await update;if(saved.error)return new Response('Try later',{status:503});return Response.json({ok:true});
}}}});
