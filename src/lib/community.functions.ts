import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getRooms=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const [rooms,members,bingo,verified]=await Promise.all([context.supabase.from('community_rooms').select('*').order('created_at',{ascending:false}).limit(100),context.supabase.from('room_members').select('room_id,user_id').limit(1000),context.supabase.from('bingo_progress').select('cells').eq('user_id',context.userId).maybeSingle(),context.supabase.rpc('is_verified',{_user_id:context.userId})]);
 if(rooms.error || members.error || bingo.error || verified.error) throw new Error('Communities could not be loaded.');
 return {rooms:(rooms.data??[]).map(room=>({...room,memberCount:(members.data??[]).filter(m=>m.room_id===room.id).length,joined:(members.data??[]).some(m=>m.room_id===room.id&&m.user_id===context.userId)})),bingo:bingo.data?.cells??[],verified:verified.data===true};
});
const safeUrl=z.string().max(500).refine(url=>url==='' || /^https:\/\/(www\.)?(crunchyroll\.com|netflix\.com|youtube\.com|youtu\.be|hidive\.com)(\/|$)/i.test(url),'Use an official streaming link, not a download or pirated stream.');
export const createRoom=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({title:z.string().trim().min(3).max(100),anime:z.string().trim().min(1).max(150),kind:z.enum(['watch','club','seasonal','convention']),episode:z.number().int().min(1).max(10000),streaming_url:safeUrl,starts_at:z.string().optional()}).parse(input)).handler(async({data,context})=>{
 const room=await context.supabase.from('community_rooms').insert({...data,owner_id:context.userId,starts_at:data.starts_at?new Date(data.starts_at).toISOString():null}).select('id').single();
 if(room.error || !room.data) throw new Error('Identity approval is required to create a room.');
 const join=await context.supabase.from('room_members').insert({room_id:room.data.id,user_id:context.userId});if(join.error) throw new Error('Room created, but joining failed. Join from the room list.');return {id:room.data.id};
});
export const joinRoom=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid(),join:z.boolean()}).parse(input)).handler(async({data,context})=>{
 const result=data.join?await context.supabase.from('room_members').upsert({room_id:data.id,user_id:context.userId},{ignoreDuplicates:true}):await context.supabase.from('room_members').delete().eq('room_id',data.id).eq('user_id',context.userId);
 if(result.error) throw new Error('Identity approval is required to join communities.');return {ok:true};
});
export const getRoom=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
 const [room,membership,messages]=await Promise.all([context.supabase.from('community_rooms').select('*').eq('id',data.id).single(),context.supabase.from('room_members').select('user_id').eq('room_id',data.id).eq('user_id',context.userId).maybeSingle(),context.supabase.from('room_messages').select('*').eq('room_id',data.id).order('created_at',{ascending:false}).limit(100)]);
 if(room.error || !room.data || messages.error) throw new Error('Room could not be loaded.');
 const rows=await Promise.all((messages.data??[]).reverse().map(async row=>({...row,name:(await context.supabase.from('profiles').select('display_name').eq('id',row.user_id).maybeSingle()).data?.display_name??'Member'})));
 return {room:room.data,joined:!!membership.data,messages:rows,userId:context.userId};
});
export const roomMessage=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({roomId:z.string().uuid(),body:z.string().trim().min(1).max(2000),spoiler:z.boolean()}).parse(input)).handler(async({data,context})=>{
 const result=await context.supabase.from('room_messages').insert({room_id:data.roomId,user_id:context.userId,body:data.body,spoiler:data.spoiler});if(result.error) throw new Error('Join the room with an approved identity before chatting.');return {ok:true};
});
export const saveBingo=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({cells:z.array(z.string().max(100)).max(9)}).parse(input)).handler(async({data,context})=>{
 const result=await context.supabase.from('bingo_progress').upsert({user_id:context.userId,cells:data.cells});if(result.error) throw new Error('Save your profile before saving your bingo card.');return {ok:true};
});
