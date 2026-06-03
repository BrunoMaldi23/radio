import Link from 'next/link';
import { MessageCircle, Radio, Trophy } from 'lucide-react';
import { PublicPageHero } from '@/components/public-page-hero';
import { Button } from '@/components/ui/button';

export default function TvPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5">
      <PublicPageHero
        eyebrow="Senal en vivo"
        icon={Radio}
        title="Radio Labranza FM+ TV"
        description="Estudio en vivo, entrevistas, clips, musica y conversacion sincronizada con la senal de audio."
      />
      <section className="radio-panel flex flex-wrap gap-3 rounded-lg p-4">
        <Button asChild className="bg-amber-400 font-black text-slate-950 hover:bg-amber-300">
          <Link href="/ranking">
            <Trophy className="h-4 w-4" />
            Ranking
          </Link>
        </Button>
        <Button asChild className="border-slate-900/10 bg-white/70 text-slate-800 hover:bg-white" variant="outline">
          <Link href="/programas">
            <Radio className="h-4 w-4" />
            Programas
          </Link>
        </Button>
        <Button asChild className="border-slate-900/10 bg-white/70 text-slate-800 hover:bg-white" variant="outline">
          <Link href="/concursos">
            <MessageCircle className="h-4 w-4" />
            Participa
          </Link>
        </Button>
      </section>
    </div>
  );
}
