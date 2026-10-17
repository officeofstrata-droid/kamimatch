import { ageOn } from '@/lib/account-rules';
export function veriffAdultApproved(status:string,code:number|undefined,documentDob:string|null|undefined,personDob:string|null|undefined,accountDob:string,today=new Date()) {
 return status==='approved'&&code===9001&&documentDob===accountDob&&personDob===accountDob&&ageOn(accountDob,today)>=18&&ageOn(accountDob,today)<=120;
}
export async function authenticVeriffSignature(raw:string,signature:string|null,secret:string):Promise<boolean>{
 if(!signature||!/^[a-f0-9]{64}$/i.test(signature))return false;
 const bytes=Uint8Array.from(signature.match(/.{2}/g)??[],x=>parseInt(x,16));
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(raw));
}
