import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { compatibility } from '@/lib/matching';

export const getDating=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabase,userId}=context;
 const [verified,premium,own,profiles,swipes]=await Promise.all([supabase.rpc('is_verified',{_user_id:userId}),supabase.rpc('is_premium',{_user_id:userId}),supabase.from('anime_preferences').select('*').eq('user_id',userId).maybeSingle(),supabase.from('profiles').select('*').neq('id',userId).limit(150),supabase.from('swipes').select('target_id').eq('actor_id',userId)]);
 if(verified.error || premium.error || profiles.error || own.error || swipes.error) throw new Error('Discovery could not be loaded.');
 if(!verified.data) return {verified:false,premium:premium.data===true,profiles:[],dailyPickId:null};
 const daily=await supabase.rpc('get_daily_soulmate');
 if(daily.error)throw new Error('Your daily connection could not be loaded.');
 const seen=new Set((swipes.data??[]).map(row=>row.target_id));
 const candidates=await Promise.all((profiles.data??[]).filter(row=>!seen.has(row.id)).map(async row=>{
 const eligible=await supabase.rpc('is_verified',{_user_id:row.id});
 if(eligible.error)throw new Error('Member eligibility could not be checked.');
 if(!eligible.data)return null;
 const [taste,media]=await Promise.all([supabase.from('anime_preferences').select('*').eq('user_id',row.id).maybeSingle(),supabase.from('profile_media').select('path,kind').eq('user_id',row.id).order('created_at').limit(5)]);
 if(taste.error||media.error)throw new Error('Member details could not be loaded.');
 const photos=await Promise.all((media.data??[]).filter(x=>x.kind==='anime_photo').map(async x=>(await supabase.storage.from('profile-media').createSignedUrl(x.path,300)).data?.signedUrl));
 return {...row,photos:photos.filter((x):x is string=>!!x),...compatibility(own.data,taste.data)};
 }));
 return {verified:true,premium:premium.data===true,dailyPickId:daily.data,profiles:candidates.filter((row):row is NonNullable<typeof row>=>row!==null).sort((a,b)=>a.id===daily.data?-1:b.id===daily.data?1:b.score-a.score)};
});
export const swipeMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({target:z.string().uuid(),choice:z.enum(['like','pass','super'])}).parse(input)).handler(async({data,context})=>{
 const result=await context.supabase.rpc('cast_swipe',{_target:data.target,_choice:data.choice});
 if(result.error) throw new Error(result.error.message); return {matchId:result.data};
});
export const rewindMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const result=await context.supabase.rpc('rewind_swipe'); if(result.error) throw new Error(result.error.message); return {ok:result.data};
});
export const getMatches=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const result=await context.supabase.from('matches').select('*').order('created_at',{ascending:false});
 if(result.error) throw new Error('Matches could not be loaded.');
 const matches=await Promise.all((result.data??[]).map(async row=>{
 const other=row.user_a===context.userId?row.user_b:row.user_a;
 const [profile,last]=await Promise.all([context.supabase.from('profiles').select('display_name,avatar,watching').eq('id',other).maybeSingle(),context.supabase.from('messages').select('body,voice_path,created_at').eq('match_id',row.id).order('created_at',{ascending:false}).limit(1).maybeSingle()]);
 return {...row,other,profile:profile.data,last:last.data};
 }));return {matches};
});
export const getConversation=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
 const match=await context.supabase.from('matches').select('*').eq('id',data.id).maybeSingle();
 if(match.error || !match.data) throw new Error('This conversation is unavailable. Both members must be approved and unblocked.');
 const other=match.data.user_a===context.userId?match.data.user_b:match.data.user_a;
 const [profile,messages]=await Promise.all([context.supabase.from('profiles').select('display_name,watching,avatar').eq('id',other).maybeSingle(),context.supabase.from('messages').select('*').eq('match_id',data.id).order('created_at',{ascending:false}).limit(100)]);
 if(messages.error) throw new Error('Messages could not be loaded.');
 const rows=await Promise.all((messages.data??[]).reverse().map(async row=>({...row,voiceUrl:row.voice_path?(await context.supabase.storage.from('profile-media').createSignedUrl(row.voice_path,120)).data?.signedUrl:null})));
 return {other,profile:profile.data,messages:rows,userId:context.userId};
});
export const sendMessage=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({matchId:z.string().uuid(),body:z.string().trim().max(2000),voicePath:z.string().max(300).optional()}).refine(x=>x.body.length>0 || !!x.voicePath).parse(input)).handler(async({data,context})=>{
 const result=await context.supabase.from('messages').insert({match_id:data.matchId,sender_id:context.userId,body:data.body,voice_path:data.voicePath??null});
 if(result.error) throw new Error('Message could not be sent. Check that your match is still available.');return {ok:true};
});
export const blockMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({target:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
 if(data.target===context.userId)throw new Error('You cannot block yourself.');
 const result=await context.supabase.from('blocks').upsert({blocker_id:context.userId,blocked_id:data.target},{ignoreDuplicates:true}); if(result.error) throw new Error('Could not block this member.'); return {ok:true};
});
export const reportMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({target:z.string().uuid(),reason:z.string().trim().min(3).max(1000)}).parse(input)).handler(async({data,context})=>{
 if(data.target===context.userId)throw new Error('You cannot report yourself.');
 const result=await context.supabase.from('reports').insert({reporter_id:context.userId,reported_id:data.target,reason:data.reason}); if(result.error) throw new Error('Your report could not be submitted.');return {ok:true};
});
export const getLikes=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const premium=await context.supabase.rpc('is_premium',{_user_id:context.userId});
 if(premium.error)throw new Error('Premium status could not be checked.');
 if(!premium.data) return {premium:false,people:[]};
 const rows=await context.supabase.from('swipes').select('actor_id').eq('target_id',context.userId).in('choice',['like','super']).limit(100);
 if(rows.error) throw new Error('Likes could not be loaded.');
 const people=await Promise.all((rows.data??[]).map(async row=>(await context.supabase.from('profiles').select('id,display_name,age,avatar').eq('id',row.actor_id).maybeSingle()).data));
 return {premium:true,people:people.filter((x):x is NonNullable<typeof x>=>!!x)};
});
export const getReports=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||!role.data) throw new Error('Reviewer access required.');
 const reports=await context.supabase.from('reports').select('*').eq('status','open').order('created_at'); if(reports.error) throw new Error('Reports could not be loaded.');return reports.data;
});
export const closeReport=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(role.error||role.data!==true)throw new Error('Reviewer access is required.');
 const result=await context.supabase.from('reports').update({status:'reviewed'}).eq('id',data.id).select('id').single();if(result.error) throw new Error('Reviewer access is required.');return {ok:true};
});
