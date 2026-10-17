import { describe,it,expect } from 'vitest';
import { authenticVeriffSignature,veriffAdultApproved } from '@/lib/veriff-rules';
const today=new Date('2026-10-17T12:00:00Z');
describe('Veriff adult approval',()=>{
 it('requires an approved ID and selfie decision',()=>{expect(veriffAdultApproved('pending',9001,'1999-01-01','1999-01-01','1999-01-01',today)).toBe(false);expect(veriffAdultApproved('approved',9001,'1999-01-01','1999-01-01','1999-01-01',today)).toBe(true);});
 it('requires the verified document and person birth dates to match the profile',()=>{expect(veriffAdultApproved('approved',9001,'1999-01-01','1999-01-02','1999-01-01',today)).toBe(false);expect(veriffAdultApproved('approved',9001,null,'1999-01-01','1999-01-01',today)).toBe(false);});
 it('rejects anyone under 18 even with provider approval',()=>{expect(veriffAdultApproved('approved',9001,'2008-10-18','2008-10-18','2008-10-18',today)).toBe(false);expect(veriffAdultApproved('approved',9001,'2008-10-17','2008-10-17','2008-10-17',today)).toBe(true);});
 it('rejects an incorrect provider decision code',()=>{expect(veriffAdultApproved('approved',9002,'1999-01-01','1999-01-01','1999-01-01',today)).toBe(false);});
 it('rejects forged and modified webhook payloads',async()=>{const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('test-only-fixture'),{name:'HMAC',hash:'SHA-256'},false,['sign']);const payload='{"test":true}';const signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(payload))),x=>x.toString(16).padStart(2,'0')).join('');expect(await authenticVeriffSignature(payload,signature,'test-only-fixture')).toBe(true);expect(await authenticVeriffSignature(payload+' ',signature,'test-only-fixture')).toBe(false);expect(await authenticVeriffSignature(payload,null,'test-only-fixture')).toBe(false);});
});
