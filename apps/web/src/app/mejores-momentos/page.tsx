import { ArticleCard } from '@/components/article-card';
import { PublicPageHero } from '@/components/public-page-hero';
import { SectionHeading } from '@/components/section-heading';
import { api } from '@/lib/api';
import { mapArticle } from '@/lib/content-mappers';
import { Clapperboard } from 'lucide-react';

export default async function BestMomentsPage() {
  const articles = await api.articles('Rankings semanal').then((items) => items.map(mapArticle)).catch(() => []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Ranking de la semana"
        icon={Clapperboard}
        title="Rankings semanal"
        description="La seleccion semanal con los temas, posiciones y favoritos que se mueven en la radio."
      />
      <SectionHeading eyebrow="Ranking de la semana" title="Rankings semanal" />
      {articles.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      ) : (
        <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
          Aun no hay rankings semanales cargados.
        </div>
      )}
    </div>
  );
}
