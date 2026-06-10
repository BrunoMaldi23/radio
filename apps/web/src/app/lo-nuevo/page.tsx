import { ArticleCard } from '@/components/article-card';
import { PublicPageHero } from '@/components/public-page-hero';
import { SectionHeading } from '@/components/section-heading';
import { api } from '@/lib/api';
import { mapArticle } from '@/lib/content-mappers';
import { Sparkles } from 'lucide-react';

export default async function NewPage() {
  const articles = await api.articles('Exitos 90,2000').then((items) => items.map(mapArticle)).catch(() => []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Clasicos y favoritos"
        icon={Sparkles}
        title="Exitos 90,2000"
        description="Canciones, recuerdos y favoritos de los 90 y 2000 que siguen sonando fuerte."
      />
      <SectionHeading eyebrow="Clasicos y favoritos" title="Exitos 90,2000" />
      {articles.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      ) : (
        <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
          Aun no hay publicaciones en Exitos 90,2000.
        </div>
      )}
    </div>
  );
}
