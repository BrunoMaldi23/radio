'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, type Article } from '@/lib/api';
import { EditorialCover } from '@/components/editorial-cover';

function safeImage(value?: string | null) {
  if (!value) return null;
  if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) return value;
  return null;
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null | 'loading'>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.articleBySlug(slug)
      .then((result) => {
        if (!result || result.status !== 'PUBLISHED') {
          setNotFound(true);
        } else {
          setArticle(result);
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const date = article && typeof article === 'object'
    ? new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt!))
    : 'Publicado ahora';

  if (notFound) {
    return (
      <article className="mx-auto max-w-4xl p-6">
        <Button asChild className="mb-6 border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-100" variant="outline">
          <Link href="/noticias">
            <ArrowLeft className="h-4 w-4" />
            Volver a noticias
          </Link>
        </Button>
        <div className="grid min-h-72 place-items-center">
          <div className="text-center">
            <h1 className="text-4xl font-black text-zinc-950">Articulo no encontrado</h1>
            <p className="mt-3 text-zinc-500">Esta publicacion no existe o no esta disponible.</p>
          </div>
        </div>
      </article>
    );
  }

  if (article === null || article === 'loading') {
    return (
      <article className="mx-auto max-w-4xl p-6">
        <Button asChild className="mb-6 border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-100" variant="outline">
          <Link href="/noticias">
            <ArrowLeft className="h-4 w-4" />
            Volver a noticias
          </Link>
        </Button>
        <div className="grid min-h-72 place-items-center">
          <p className="text-2xl font-black text-zinc-950">Cargando...</p>
        </div>
      </article>
    );
  }

  const coverUrl = safeImage(article.coverUrl);

  return (
    <article className="mx-auto max-w-4xl">
      <Button asChild className="mb-6 border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-100" variant="outline">
        <Link href="/noticias">
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>
      </Button>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="aspect-[16/8] bg-zinc-950">
          {coverUrl ? (
            <img alt="" className="h-full w-full object-cover" src={coverUrl} />
          ) : (
            <EditorialCover category={article.category} title={article.title} featured />
          )}
        </div>
        <div className="grid gap-5 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-zinc-500">
            <span className="rounded-md bg-amber-100 px-3 py-1 text-zinc-950">{article.category}</span>
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {date}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-normal text-zinc-950 sm:text-5xl">{article.title}</h1>
          <p className="text-lg leading-8 text-zinc-600">{article.excerpt}</p>
          <div
            className="prose prose-slate max-w-none border-t border-zinc-200 pt-6 text-zinc-800 prose-p:leading-8 prose-a:text-amber-700 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.body || '<p>Sin contenido.</p>' }}
          />
        </div>
      </div>
    </article>
  );
}
