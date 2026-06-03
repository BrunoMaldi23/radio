import { ArticleCard } from '@/components/article-card';
import { PublicPageHero } from '@/components/public-page-hero';
import { SectionHeading } from '@/components/section-heading';
import { api } from '@/lib/api';
import { mapArticle } from '@/lib/content-mappers';
import { Clapperboard } from 'lucide-react';

export default async function BestMomentsPage() {
  const articles = await api.articles('Mejores momentos').then((items) => items.map(mapArticle)).catch(() => []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Clips de cabina"
        icon={Clapperboard}
        title="Mejores momentos"
        description="Entrevistas, visitas, risas y escenas para volver a vivir la energia de la radio."
      />
      <SectionHeading eyebrow="Clips de cabina" title="Mejores momentos" />
      {articles.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      ) : (
        <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
          Aun no hay mejores momentos cargados.
        </div>
      )}
    </div>
  );
}
