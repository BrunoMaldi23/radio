import Link from 'next/link';
import { Radio, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TvPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="radio-panel rounded-lg p-5">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
          <Radio className="h-4 w-4" />
          Senal en vivo
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Radio Labranza FM+ TV</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Estudio en vivo, entrevistas, clips, musica y conversacion sincronizada con la senal de audio.
        </p>
      </section>

      <section className="radio-panel flex flex-wrap gap-3 rounded-lg p-4 lg:flex-col">
        <Button asChild className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300 lg:justify-start">
          <Link href="/ranking">
            <Trophy className="h-4 w-4" />
            Ranking
          </Link>
        </Button>
        <Button asChild className="border-slate-900/10 bg-white/70 text-slate-800 hover:bg-white lg:justify-start" variant="outline">
          <Link href="/programas">
            <Radio className="h-4 w-4" />
            Programas
          </Link>
        </Button>
      </section>
    </div>
  );
}
