import { z } from 'zod';
import { ageOn } from '@/lib/account-rules';
const step=z.object({status:z.string()});
export const diditDecisionSchema=z.object({status:z.string(),environment:z.string(),session_id:z.string().uuid(),workflow_id:z.string().uuid(),vendor_data:z.string(),id_verifications:z.array(step.extend({date_of_birth:z.string().nullable().optional(),verification_method:z.string().optional()})).default([]),liveness_checks:z.array(step.extend({method:z.string()})).default([]),face_matches:z.array(step).default([])});
export function diditAdultApproved(decision:unknown,accountDob:string,today=new Date()):boolean{
 const parsed=diditDecisionSchema.safeParse(decision);if(!parsed.success)return false;const d=parsed.data;
 const age=ageOn(accountDob,today);
 const birth=new Date(`${accountDob}T00:00:00Z`);
 return d.status==='Approved'&&d.environment==='live'&&age>=18&&age<=120&&!Number.isNaN(birth.getTime())&&birth.toISOString().slice(0,10)===accountDob
 &&d.id_verifications.length>0&&d.id_verifications.every(x=>x.status==='Approved'&&(x.verification_method===undefined||x.verification_method==='document')&&x.date_of_birth===accountDob)
 &&d.liveness_checks.length>0&&d.liveness_checks.every(x=>x.status==='Approved'&&['PASSIVE','FLASHING','ACTIVE_3D'].includes(x.method))
 &&d.face_matches.length>0&&d.face_matches.every(x=>x.status==='Approved');
}
export function canonicalDiditJson(value:unknown):string{
 if(Array.isArray(value))return `[${value.map(canonicalDiditJson).join(',')}]`;
 if(value!==null&&typeof value==='object')return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonicalDiditJson((value as Record<string,unknown>)[key])}`).join(',')}}`;
 return JSON.stringify(value);
}
async function verifyHmac(text:string,signature:string|null,secret:string){
 if(!signature||!/^[a-f0-9]{64}$/i.test(signature))return false;
 const bytes=Uint8Array.from(signature.match(/.{2}/g)??[],x=>parseInt(x,16));
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(text));
}
export async function authenticDiditWebhook(raw:string,headers:Headers,secret:string,now=Math.floor(Date.now()/1000)){
 const timestamp=headers.get('x-timestamp');if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(now-Number(timestamp))>300)return false;
 let payload:unknown;try{payload=JSON.parse(raw);}catch{return false;}
 if(!payload||typeof payload!=='object'||('timestamp' in payload&&payload.timestamp!==Number(timestamp)))return false;
 if(await verifyHmac(canonicalDiditJson(payload),headers.get('x-signature-v2'),secret))return true;
 return verifyHmac(raw,headers.get('x-signature'),secret);
}
export function diditHostedUrl(url:string){const u=new URL(url);if(u.protocol!=='https:'||u.hostname!=='verify.didit.me'||u.username||u.password)throw new Error('Didit returned an invalid verification link.');return u.toString();}
