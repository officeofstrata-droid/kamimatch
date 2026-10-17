import { describe,it,expect } from 'vitest';
import { authenticDiditWebhook,canonicalDiditJson,diditAdultApproved,diditHostedUrl } from '@/lib/didit-rules';
const today=new Date('2026-10-17T12:00:00Z');
const id='11111111-2222-4333-8444-555555555555';
const good={status:'Approved',environment:'live',session_id:id,workflow_id:id,vendor_data:id,id_verifications:[{status:'Approved',date_of_birth:'1999-01-01',verification_method:'document'}],liveness_checks:[{status:'Approved',method:'PASSIVE'}],face_matches:[{status:'Approved'}]};
describe('Didit adult identity rules',()=>{
 it('requires approved government ID, live selfie and face match',()=>{expect(diditAdultApproved(good,'1999-01-01',today)).toBe(true);expect(diditAdultApproved({...good,liveness_checks:[]},'1999-01-01',today)).toBe(false);expect(diditAdultApproved({...good,face_matches:[{status:'Declined'}]},'1999-01-01',today)).toBe(false);});
 it('requires extracted document DOB to match account DOB',()=>{expect(diditAdultApproved(good,'1999-01-02',today)).toBe(false);});
 it('requires age 18 or older',()=>{const d={...good,id_verifications:[{status:'Approved',date_of_birth:'2008-10-18'}]};expect(diditAdultApproved(d,'2008-10-18',today)).toBe(false);expect(diditAdultApproved({...d,id_verifications:[{status:'Approved',date_of_birth:'2008-10-17'}]},'2008-10-17',today)).toBe(true);});
 it('never approves sandbox identities',()=>{expect(diditAdultApproved({...good,environment:'sandbox'},'1999-01-01',today)).toBe(false);});
 it('requires documentary verification instead of identity lookup',()=>{expect(diditAdultApproved({...good,id_verifications:[{status:'Approved',date_of_birth:'1999-01-01',verification_method:'id_lookup'}]},'1999-01-01',today)).toBe(false);});
 it('rejects forged decisions, stale timestamps and simple envelope-only signatures',async()=>{
 const payload={timestamp:1000,decision:{status:'Approved',name:'José'}};const raw=JSON.stringify(payload),secret='test-only-fixture';const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sign=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(canonicalDiditJson(payload)))),x=>x.toString(16).padStart(2,'0')).join('');const h=new Headers({'x-timestamp':'1000','x-signature-v2':sign});expect(await authenticDiditWebhook(raw,h,secret,1000)).toBe(true);expect(await authenticDiditWebhook(raw.replace('Approved','Declined'),h,secret,1000)).toBe(false);expect(await authenticDiditWebhook(raw,h,secret,1301)).toBe(false);expect(await authenticDiditWebhook(raw,new Headers({'x-timestamp':'1000','x-signature-simple':sign}),secret,1000)).toBe(false);
 });
 it('rejects hosted links outside Didit',()=>{expect(diditHostedUrl(`https://verify.didit.me/session/${id}`)).toContain('verify.didit.me');expect(()=>diditHostedUrl('https://verify.didit.me.evil.example/session')).toThrow();});
});
