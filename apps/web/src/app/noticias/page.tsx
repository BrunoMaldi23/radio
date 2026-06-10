'use client';

import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/article-card';
import { PublicPageHero } from '@/components/public-page-hero';
import { SectionHeading } from '@/components/section-heading';
import { api } from '@/lib/api';
import { mapArticle } from '@/lib/content-mappers';
import { Newspaper } from 'lucide-react';

export default function NewsPage() {
  const [articles, setArticles] = useState<ReturnType<typeof mapArticle>[]>([]);

  useEffect(() => {
    api.articles('Noticias').then((items) => setArticles(items.map(mapArticle))).catch(() => setArticles([]));
  }, []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Actualidad local"
        icon={Newspaper}
        title="Noticias"
        description="Historias, avisos y novedades para estar cerca de lo que pasa en Labranza y sus alrededores."
      />
      <SectionHeading eyebrow="Actualidad pop" title="Noticias" />
      {articles.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard article={article} featured={index === 0} key={article.slug} />
          ))}
        </div>
      ) : (
        <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
          Aun no hay noticias publicadas.
        </div>
      )}
    </div>
  );
}
