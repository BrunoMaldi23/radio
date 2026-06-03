import { ArticleCard } from '@/components/article-card';
import { PublicPageHero } from '@/components/public-page-hero';
import { SectionHeading } from '@/components/section-heading';
import { api } from '@/lib/api';
import { mapArticle } from '@/lib/content-mappers';
import { Gift } from 'lucide-react';

export default async function ContestsPage() {
  const contests = await api.articles('Concursos').then((items) => items.map(mapArticle)).catch(() => []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Participa"
        icon={Gift}
        title="Concursos"
        description="Campanas, premios y dinamicas para que la audiencia sea parte de la programacion."
      />
      <SectionHeading eyebrow="Participa" title="Concursos" />
      {contests.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {contests.map((contest) => (
            <ArticleCard article={contest} key={contest.slug} />
          ))}
        </div>
      ) : (
        <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
          Aun no hay concursos activos.
        </div>
      )}
    </div>
  );
}
