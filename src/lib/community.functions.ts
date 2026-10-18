import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { roomSchema } from '@/lib/community-rules';

export const getRooms=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const [rooms,members,bingo,verified]=await Promise.all([context.supabase.from('community_rooms').select('*').order('created_at',{ascending:false}).limit(100),context.supabase.from('room_members').select('room_id').eq('user_id',context.userId),context.supabase.from('bingo_progress').select('cells').eq('user_id',context.userId).maybeSingle(),context.supabase.rpc('is_verified',{_user_id:context.userId})]);
 if(rooms.error || members.error || bingo.error || verified.error) throw new Error('Communities could not be loaded.');
 const listed=await Promise.all((rooms.data??[]).map(async room=>{const count=await context.supabase.rpc('room_member_count',{_room:room.id});if(count.error)throw new Error('Room attendance could not be loaded.');return {...room,memberCount:count.data??0,joined:(members.data??[]).some(m=>m.room_id===room.id)};}));
 return {rooms:listed,bingo:bingo.data?.cells??[],verified:verified.data===true};
});
export const createRoom=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>roomSchema.parse(input)).handler(async({data,context})=>{
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
 if(room.error || !room.data || membership.error || messages.error) throw new Error('Room could not be loaded.');
 if(!membership.data) throw new Error('Join this community before opening its conversation.');
 const rows=await Promise.all((messages.data??[]).reverse().map(async row=>({...row,name:(await context.supabase.from('profiles').select('display_name').eq('id',row.user_id).maybeSingle()).data?.display_name??'Member'})));
 return {room:room.data,joined:!!membership.data,messages:rows,userId:context.userId};
});
export const roomMessage=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({roomId:z.string().uuid(),body:z.string().trim().min(1).max(2000),spoiler:z.boolean()}).parse(input)).handler(async({data,context})=>{
 const result=await context.supabase.from('room_messages').insert({room_id:data.roomId,user_id:context.userId,body:data.body,spoiler:data.spoiler});if(result.error) throw new Error('Join the room with an approved identity before chatting.');return {ok:true};
});
export const saveBingo=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({cells:z.array(z.string().max(100)).max(9)}).parse(input)).handler(async({data,context})=>{
 const result=await context.supabase.from('bingo_progress').upsert({user_id:context.userId,cells:data.cells});if(result.error) throw new Error('Save your profile before saving your bingo card.');return {ok:true};
});
