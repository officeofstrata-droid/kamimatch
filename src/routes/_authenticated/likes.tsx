import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { AccountShell } from '@/components/AccountShell';
import { getLikes } from '@/lib/dating.functions';
import { Button } from '@/components/ui/button';
const options=queryOptions({queryKey:['likes'],queryFn:()=>getLikes()});
export const Route=createFileRoute('/_authenticated/likes')({ staticData: { sitemap: false },loader:({context})=>context.queryClient.ensureQueryData(options),head:()=>({meta:[{title:'Who likes you — KamiMatch'},{name:'description',content:'See incoming likes with KamiMatch Premium.'},{property:'og:title',content:'Who likes you — KamiMatch'},{property:'og:description',content:'Your incoming likes, privately shown to you.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:Likes});
function Likes(){const {data}=useSuspenseQuery(options);return <AccountShell title="Someone's thinking of you"><Heart className="h-10 w-10 text-primary"/>{!data.premium?<><p className="mt-4 text-sm">See who likes you with Premium. Mutual matches remain free.</p><Button asChild className="mt-5"><Link to="/premium">View Premium</Link></Button></>:data.people.length?<div className="mt-5 space-y-4">{data.people.map(p=><p key={p.id} className="border-b border-border pb-3 font-bold">{p.display_name} · {p.age}</p>)}<Button asChild><Link to="/">Back to discovery</Link></Button></div>:<p className="mt-4 text-sm text-muted-foreground">No incoming likes yet.</p>}</AccountShell>;}
