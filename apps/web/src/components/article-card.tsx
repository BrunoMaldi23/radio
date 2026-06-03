'use client';

import Link from 'next/link';
import { fallbackImage } from '@/lib/content-mappers';

type Article = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
};

type ArticleCardProps = {
  article: Article;
  featured?: boolean;
};

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <Link
      className="group grid overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-[0_22px_60px_rgba(15,23,42,0.14)]"
      href={`/noticias/${article.slug}`}
    >
      <div className={featured ? 'relative aspect-[16/10] overflow-hidden bg-slate-950' : 'relative aspect-[16/11] overflow-hidden bg-slate-950'}>
        <img
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          src={article.imageUrl}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/45 to-transparent" />
      </div>
      <div className="grid gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-normal text-amber-800 ring-1 ring-amber-200">{article.category}</span>
          <span className="text-xs font-bold text-slate-400">{article.date}</span>
        </div>
        <h3 className={featured ? 'text-xl font-black leading-tight text-slate-950' : 'text-base font-black leading-tight text-slate-950'}>
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{article.excerpt}</p>
      </div>
    </Link>
  );
}
