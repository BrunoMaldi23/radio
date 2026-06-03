import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays, Gift, Headphones, Mic2, Music2, Play, Radio, Sparkles, Tv } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';
import { ProgramCard } from '@/components/program-card';
import { SectionHeading } from '@/components/section-heading';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { mapArticle, mapProgram } from '@/lib/content-mappers';

const liveSignals = [
  { title: 'Senal de Audio', description: 'Radio Labranza FM+ en vivo todo el dia', icon: Radio },
  { title: 'Musica y compania', description: 'FM 107.5 desde Labranza', icon: Music2 },
  { title: 'Labranza TV', description: 'Estudio, entrevistas y video en vivo', icon: Tv }
];

async function getHomeData() {
  const [articles, moments, contests, programs, ranking] = await Promise.all([
    api.articles('Noticias').then((items) => items.map(mapArticle)).catch(() => []),
    api.articles('Mejores momentos').then((items) => items.map(mapArticle)).catch(() => []),
    api.articles('Concursos').then((items) => items.map(mapArticle)).catch(() => []),
    api.programsPublic().then((items) => items.map(mapProgram)).catch(() => []),
    api.ranking().catch(() => [])
  ]);

  return { articles, moments, contests, programs, ranking };
}

export default async function Home() {
  const { articles, moments, contests, programs, ranking } = await getHomeData();

  return (
    <div className="mx-auto grid max-w-7xl gap-10">
      <section className="ink-panel relative grid min-h-[500px] overflow-hidden rounded-xl text-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="absolute inset-0 frequency-lines opacity-60" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
        <div className="relative grid content-center gap-6 p-5 sm:p-8 lg:p-10">
          <div className="w-fit rounded-lg border border-white/15 bg-white px-5 py-4 shadow-2xl shadow-black/30">
            <Image alt="Radio Labranza FM+" className="h-24 w-auto object-contain sm:h-28" height={132} priority src="/logo-radio.png" width={420} />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              <span className="h-2 w-2 rounded-full bg-rose-400 live-dot" />
              FM 107.5 desde Labranza
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-black leading-none tracking-tight sm:text-6xl">La radio local con pulso digital</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Musica, noticias, TV en vivo, concursos y comunidad en una experiencia hecha para sonar cercana y verse moderna.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-12 rounded-full bg-amber-400 px-6 font-black text-slate-950 shadow-lg shadow-amber-950/30 hover:bg-amber-300">
              <Link href="/tv">
                <Play className="h-4 w-4" />
                Ver en vivo
              </Link>
            </Button>
            <Button asChild className="h-12 rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/20" variant="outline">
              <Link href="/noticias">Ultimas noticias</Link>
            </Button>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-2 pt-2 text-xs font-bold text-slate-300">
            {['107.5 FM', 'TV Digital', 'Ranking Live'].map((item) => (
              <span className="rounded-md border border-white/10 bg-white/6 px-3 py-2" key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[300px] bg-[linear-gradient(180deg,rgba(5,10,22,0.03),rgba(5,10,22,0.56)),url('https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 signal-grid opacity-20" />
          <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/20 bg-slate-950/70 p-4 text-white shadow-xl backdrop-blur">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-teal-200">
              <Mic2 className="h-4 w-4" />
              Ahora en vivo
            </p>
            <p className="mt-1 text-2xl font-black">Labranza FM+ Online</p>
            <p className="mt-2 text-sm text-slate-300">Cabina abierta, comunidad conectada.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {liveSignals.map((signal) => {
          const Icon = signal.icon;
          return (
            <Link
              className="radio-panel group flex min-h-24 items-center gap-4 rounded-lg p-4 transition hover:-translate-y-1 hover:border-amber-300"
              href={signal.title === 'Labranza TV' ? '/tv' : '/ranking'}
              key={signal.title}
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-amber-300 shadow-sm ring-1 ring-slate-900/10">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-normal text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-500 live-dot" />
                  En vivo
                </span>
                <span className="block truncate text-lg font-black text-slate-950">{signal.title}</span>
                <span className="block truncate text-sm text-slate-500">{signal.description}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600" />
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div>
          <SectionHeading eyebrow="Actualidad local" href="/noticias" title="Noticias destacadas" />
          {articles.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {articles.slice(0, 2).map((article, index) => (
                <ArticleCard article={article} featured={index === 0} key={article.slug} />
              ))}
            </div>
          ) : (
            <div className="radio-panel grid min-h-72 place-items-center rounded-lg border-dashed p-6 text-center">
              <div>
                <CalendarDays className="mx-auto h-10 w-10 text-amber-500" />
                <p className="mt-3 text-lg font-black text-slate-950">Sin noticias publicadas</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Pronto veras aqui las ultimas publicaciones de Radio Labranza FM+.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="grid gap-4">
          <div className="ink-panel rounded-lg p-5 text-white">
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-teal-300" />
              <h2 className="text-xl font-black">Ranking Labranza</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {ranking.slice(0, 3).map((song, index) => {
                return (
                  <Link className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 p-3 transition hover:bg-white/20" href="/ranking" key={song.id}>
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-amber-400 text-sm font-black text-slate-950">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-white">{song.title}</span>
                      <span className="block truncate text-xs text-slate-300">{song.artist}</span>
                    </span>
                    <ArrowRight className="ml-auto h-4 w-4 text-rose-300" />
                  </Link>
                );
              })}
              {!ranking.length && (
                <div className="rounded-md border border-dashed border-white/20 bg-white/10 p-4 text-sm font-semibold text-slate-300">
                  Pronto podras votar por tus canciones favoritas.
                </div>
              )}
            </div>
          </div>

          {contests.slice(0, 1).map((contest) => (
            <ArticleCard article={contest} key={contest.slug} />
          ))}
          {!contests.length && (
            <Link className="radio-panel rounded-lg p-5" href="/concursos">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-normal text-amber-700">
                <Gift className="h-4 w-4" />
                Concursos
              </p>
              <h3 className="mt-2 text-xl font-black text-slate-950">Listo para activar campanas</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Publica concursos desde admin y se mostraran aqui.</p>
            </Link>
          )}
        </aside>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-900/10 bg-white/55 p-4 backdrop-blur md:grid-cols-3">
        {[
          { label: 'Cabina', value: 'En directo', icon: Radio },
          { label: 'Comunidad', value: 'Labranza conectada', icon: Sparkles },
          { label: 'Musica', value: 'Ranking activo', icon: Music2 }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div className="flex items-center gap-3 rounded-lg bg-white/70 p-4" key={item.label}>
              <span className="grid h-10 w-10 place-items-center rounded-md bg-teal-100 text-teal-800">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                <span className="block font-black text-slate-950">{item.value}</span>
              </span>
            </div>
          );
        })}
      </section>

      <section>
        <SectionHeading eyebrow="Lo nuevo con Javi" href="/lo-nuevo" title="Mas noticias" />
        {articles.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {articles.slice(0, 4).map((article, index) => (
              <ArticleCard article={article} featured={index === 0} key={article.slug} />
            ))}
          </div>
        ) : (
          <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
            Aun no hay noticias publicadas.
          </div>
        )}
      </section>

      <section>
        <SectionHeading eyebrow="Clips y entrevistas" href="/mejores-momentos" title="Mejores momentos" />
        {moments.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {moments.slice(0, 3).map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        ) : (
          <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
            Aun no hay mejores momentos cargados.
          </div>
        )}
      </section>

      <section>
        <SectionHeading eyebrow="Parrilla" href="/programas" title="Programas" />
        {programs.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {programs.slice(0, 3).map((program) => (
              <ProgramCard key={program.name} program={program} />
            ))}
          </div>
        ) : (
          <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
            Aun no hay programas cargados.
          </div>
        )}
      </section>
    </div>
  );
}
