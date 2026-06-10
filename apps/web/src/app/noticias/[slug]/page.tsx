import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { EditorialCover } from '@/components/editorial-cover';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function safeImage(value?: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return null;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await api.articleBySlug(slug).catch(() => null);

  if (!article || article.status !== 'PUBLISHED') {
    notFound();
  }

  const date = article.publishedAt
    ? new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(article.publishedAt))
    : 'Publicado ahora';
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
