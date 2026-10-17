import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { ImagePlus, Trash2, Video, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/SessionProvider';
import { supabase } from '@/integrations/supabase/client';
import { getMedia, convertPhoto, addVideo, deleteMedia } from '@/lib/media.functions';
import { PHOTO_ALLOWANCE } from '@/lib/plans';

export function ProfileGallery({ verified }: { verified: boolean }) {
 const { user } = useSession(); const client=useQueryClient();
 const load=useServerFn(getMedia), convert=useServerFn(convertPhoto), video=useServerFn(addVideo), remove=useServerFn(deleteMedia);
 const gallery=useQuery({queryKey:['gallery',user?.id],queryFn:()=>load(),enabled:!!user,refetchInterval:240000});
 const [style,setStyle]=useState<'sakura'|'cinematic'|'manga'>('sakura'); const [consent,setConsent]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
 const premium=gallery.data?.premium===true; const allowance=premium?PHOTO_ALLOWANCE.premium:PHOTO_ALLOWANCE.free;
 async function upload(file:File|undefined,kind:'photo'|'video') {
 if(!file||!user) return; setError('');setNotice('');
 if(kind==='photo'&&!consent){setError('Please confirm that this is your photo and you consent to its transformation.');return;}
 if(kind==='video'&&(!premium||!verified)){setError('Videos require premium and approved identity.');return;}
 const types=kind==='photo'?['image/jpeg','image/png','image/webp']:['video/mp4','video/quicktime'];
 if(!types.includes(file.type)||file.size>(kind==='photo'?10:50)*1024*1024){setError(kind==='photo'?'Choose a JPG, PNG or WebP under 10 MB.':'Choose an MP4 or MOV under 50 MB.');return;}
 const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/quicktime':'mov'} as Record<string,string>)[file.type];
 const path=`${user.id}/${crypto.randomUUID()}.${ext}`;const bucket=kind==='photo'?'profile-originals':'profile-media';setBusy(true);
 try { const result=await supabase.storage.from(bucket).upload(path,file,{contentType:file.type});if(result.error)throw new Error('Your upload did not finish. Please try again.');
 if(kind==='photo'){const converted=await convert({data:{path,style,consent:true}});setNotice(converted.originalRemoved?'Your anime portrait is ready. Your original has been removed.':'Your anime portrait is ready. Your original is still private; removal did not finish.');}else{await video({data:{path}});setNotice('Your video is now in your gallery.');}
 await client.invalidateQueries({queryKey:['gallery']});
 }catch(e){setError(e instanceof Error?e.message:'Upload could not finish.');await client.invalidateQueries({queryKey:['gallery']});}finally{setBusy(false);}
 }
 async function deleteItem(id:string){setBusy(true);setError('');try{await remove({data:{id}});await client.invalidateQueries({queryKey:['gallery']});}catch(e){setError(e instanceof Error?e.message:'Could not delete.');}finally{setBusy(false);}}
 return <section className="mt-8 border-t border-border pt-6"><h2 className="flex items-center gap-2 font-display text-2xl"><Sparkles className="text-primary"/>Your anime gallery</h2>
 <p className="mt-2 text-xs text-muted-foreground">{gallery.data?.used??0} / {allowance} photo conversions this month · Originals stay private.</p>
 {gallery.isPending&&<p role="status" className="mt-3 text-sm">Loading portraits…</p>}{gallery.error&&<p role="alert" className="text-sm text-destructive">Gallery could not be loaded.</p>}
 <div className="mt-4 grid grid-cols-2 gap-3">{gallery.data?.media.map(item=><div key={item.id} className="relative overflow-hidden rounded-lg border border-border bg-card">{item.url?(item.kind==='video'?<video src={item.url} controls playsInline className="aspect-[2/3] w-full object-cover"/>:<img src={item.url} alt="Your transformed anime portrait" className="aspect-[2/3] w-full object-cover"/>):<p className="p-4 text-xs">Portrait unavailable</p>}<Button size="icon" variant="secondary" className="absolute right-2 top-2" disabled={busy} aria-label="Delete gallery item" title="Delete gallery item" onClick={()=>deleteItem(item.id)}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
 {!gallery.isPending&&!gallery.data?.media.length&&<p className="my-4 text-sm text-muted-foreground">Your first portrait belongs here.</p>}
 <fieldset className="mt-5"><legend className="text-sm font-bold">Portrait style</legend><div className="mt-2 flex flex-wrap gap-2">{(['sakura','cinematic','manga'] as const).map(s=><Button key={s} variant={style===s?'default':'outline'} aria-pressed={style===s} disabled={busy||(s!=='sakura'&&!premium)} onClick={()=>setStyle(s)}>{s==='sakura'?'Sakura (cherry blossom)':s==='manga'?'Manga (comic)':'Cinematic'}{s!=='sakura'&&!premium?' · Premium':''}</Button>)}</div></fieldset>
 <label className="mt-4 flex items-start gap-2 text-xs"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="accent-primary"/>This is my photo, I am 18+, and I consent to an anime-style transformation.</label>
 <div className="mt-4 flex flex-wrap gap-2"><Button asChild disabled={busy||!consent||(gallery.data?.used??0)>=allowance}><label className="cursor-pointer"><ImagePlus/> {busy?'Working…':'Add anime photo'}<input aria-label="Upload a photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy||!consent||(gallery.data?.used??0)>=allowance} onChange={e=>{void upload(e.target.files?.[0],'photo');e.target.value='';}}/></label></Button>{premium&&verified?<Button asChild variant="outline" disabled={busy}><label className="cursor-pointer"><Video/>Add video<input aria-label="Upload a video" type="file" accept="video/mp4,video/quicktime" className="sr-only" disabled={busy} onChange={e=>{void upload(e.target.files?.[0],'video');e.target.value='';}}/></label></Button>:<Button asChild variant="outline"><Link to="/premium"><Video/>Videos · Premium</Link></Button>}</div>
 {busy&&<p role="status" className="mt-3 text-sm text-primary">Creating your portrait. This can take a little while…</p>}{error&&<p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}{notice&&<p role="status" className="mt-3 text-sm text-primary">{notice}</p>}
 </section>;
}
