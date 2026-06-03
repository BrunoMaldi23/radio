import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  href?: string;
  actionLabel?: string;
};

export function SectionHeading({ eyebrow, title, href, actionLabel = 'Ver mas' }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/78 px-4 py-2 text-sm font-black text-slate-800 shadow-sm backdrop-blur transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800" href={href}>
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
