import { Link } from '@tanstack/react-router';
import { ArrowLeft, Flame } from 'lucide-react';
import type { ReactNode } from 'react';
import { Petals } from '@/components/Petals';
import { Button } from '@/components/ui/button';

export function AccountShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <main className="sakura-sky relative min-h-screen font-sans text-foreground"><Petals /><div className="relative mx-auto max-w-md px-5 pb-16">
    <header className="flex items-center justify-between py-5"><Button asChild variant="ghost" size="icon" className="rounded-full"><Link to="/" aria-label="Back to discover"><ArrowLeft /></Link></Button><Link to="/" className="flex items-center gap-1.5 font-display text-xl text-brand"><Flame className="text-primary" />kamimatch</Link><span className="w-9" /></header>
    <h1 className="mt-3 font-display text-3xl">{title}</h1>{subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}<div className="mt-7">{children}</div>
  </div></main>;
}