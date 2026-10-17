import { createFileRoute, Link } from '@tanstack/react-router';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useEffect, useRef, useState } from 'react';
import { Camera, Check, ShieldCheck, Upload } from 'lucide-react';
import { getAccount, submitIdentity } from '@/lib/account.functions';
import { AccountShell } from '@/components/AccountShell';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const options = () => queryOptions({ queryKey: ['account'], queryFn: () => getAccount() });
export const Route = createFileRoute('/_authenticated/verify')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options()),
  head: () => ({ meta: [{ title: 'Private identity check — WaifuMatch' }, { name: 'description', content: 'Submit your government ID and live camera selfie for private adult identity review.' }, { property: 'og:title', content: 'Private identity check — WaifuMatch' }, { property: 'og:description', content: 'Private ID and selfie review for adult dating safety.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { data: account } = useSuspenseQuery(options());
  const submit = useServerFn(submitIdentity);
  const queryClient = useQueryClient();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<Blob | null>(null);
  const [selfieUrl, setSelfieUrl] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const pending = account.identity?.status === 'pending';
  const approved = account.identity?.status === 'approved';
  useEffect(() => () => { stream.current?.getTracks().forEach((track) => track.stop()); }, []);
  useEffect(() => { if (cameraOn && video.current && stream.current) video.current.srcObject = stream.current; }, [cameraOn]);
  useEffect(() => { if (!selfie) return; const url = URL.createObjectURL(selfie); setSelfieUrl(url); return () => URL.revokeObjectURL(url); }, [selfie]);
  async function startCamera() {
    setError('');
    try { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }); setCameraOn(true); setSelfie(null); }
    catch { setError('Allow camera access to take a live selfie. A photo upload cannot replace this step.'); }
  }
  function capture() {
    const element = video.current;
    if (!element || !element.videoWidth) { setError('Wait for the camera picture, then try again.'); return; }
    const canvas = document.createElement('canvas'); canvas.width = element.videoWidth; canvas.height = element.videoHeight;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.drawImage(element, 0, 0);
    canvas.toBlob((blob) => { if (!blob) return; setSelfie(blob); setCameraOn(false); stream.current?.getTracks().forEach((track) => track.stop()); }, 'image/jpeg', 0.9);
  }
  async function send() {
    if (!idFile || !selfie || !consent || busy) return;
    setError(''); setBusy(true);
    try {
      const prefix = `${account.userId}/${crypto.randomUUID()}`;
      const idPath = `${prefix}-id`; const selfiePath = `${prefix}-selfie.jpg`;
      const idResult = await supabase.storage.from('identity-checks').upload(idPath, idFile, { contentType: idFile.type });
      if (idResult.error) throw new Error('Your ID could not be uploaded. Please try a JPG, PNG or PDF under 10 MB.');
      const selfieResult = await supabase.storage.from('identity-checks').upload(selfiePath, selfie, { contentType: 'image/jpeg' });
      if (selfieResult.error) throw new Error('Your selfie could not be uploaded. Please retry.');
      await submit({ data: { id_path: idPath, selfie_path: selfiePath } });
      await queryClient.invalidateQueries({ queryKey: ['account'] }); setIdFile(null); setSelfie(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Your check could not be submitted.'); }
    finally { setBusy(false); }
  }
  return <AccountShell title="A real you, behind the avatar" subtitle="Government ID + a live camera selfie. Private, reviewed, adults only.">
    {!account.details ? <div className="space-y-4"><p className="text-sm">Save your profile and date of birth before starting your identity check.</p><Button asChild className="rounded-full"><Link to="/profile">Complete my profile</Link></Button></div> : pending || approved ? <div className="space-y-4 border-y border-border py-8 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-primary" /><h2 className="font-display text-2xl">{approved ? 'Your identity is approved' : 'Your check is awaiting review'}</h2><p className="text-sm text-muted-foreground">{approved ? 'Your adult identity check is complete.' : 'A trusted reviewer must check your ID, date of birth and selfie before meeting is unlocked. No automatic approval.'}</p><Button asChild variant="outline" className="rounded-full"><Link to="/profile">Back to my profile</Link></Button></div> : <div className="space-y-7">
      {account.identity?.status === 'rejected' && <p role="alert" className="rounded-md bg-secondary p-3 text-sm">Please try again: {account.identity.reviewer_note}</p>}
      <section><h2 className="flex items-center gap-2 text-lg font-bold"><Upload className="text-primary" />1. Government photo ID</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">A clear passport, driving licence or national ID showing your photograph and date of birth. Only authorised reviewers can access it.</p><label className="mt-4 block cursor-pointer rounded-lg border-2 border-dashed border-border bg-card p-5 text-center text-sm font-bold"><Upload className="mx-auto mb-2 text-primary" />{idFile ? idFile.name : 'Choose ID photo or PDF'}<input aria-label="Government ID" type="file" accept="image/jpeg,image/png,application/pdf" className="mt-3 block w-full text-xs" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) { setError('Use a JPG, PNG or PDF under 10 MB.'); return; } setIdFile(file); setError(''); }} /></label></section>
      <section><h2 className="flex items-center gap-2 text-lg font-bold"><Camera className="text-primary" />2. Live selfie</h2><p className="mt-2 text-xs text-muted-foreground">Face the camera in good light. This is a camera capture for manual review, not an automated liveness test.</p>{cameraOn && <video ref={video} autoPlay muted playsInline className="mt-4 aspect-[4/3] w-full rounded-lg bg-muted object-cover" />}{selfie && selfieUrl && <img src={selfieUrl} alt="Your captured live selfie" className="mt-4 aspect-[4/3] w-full rounded-lg object-cover" />}<Button onClick={cameraOn ? capture : startCamera} variant="outline" className="mt-4 h-11 w-full rounded-full"><Camera />{cameraOn ? 'Take selfie' : selfie ? 'Retake selfie' : 'Open camera'}</Button>{selfie && <p className="mt-2 flex items-center gap-1 text-xs text-primary"><Check />Selfie captured</p>}</section>
      <label className="flex items-start gap-3 text-xs leading-relaxed"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 accent-primary" />I consent to private storage and manual review of my ID and selfie for adult identity verification. I understand these documents are sensitive.</label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={!idFile || !selfie || !consent || busy} onClick={send} className="h-12 w-full rounded-full bg-brand font-bold">{busy ? 'Submitting privately…' : 'Submit my identity check'}</Button>
    </div>}
  </AccountShell>;
}