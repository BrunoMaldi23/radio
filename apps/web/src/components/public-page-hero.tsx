import type { LucideIcon } from 'lucide-react';
import type React from 'react';

type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export function PublicPageHero({ eyebrow, title, description, icon: Icon, action }: PublicPageHeroProps) {
  return (
    <section className="ink-panel relative overflow-hidden rounded-xl p-5 text-white sm:p-7">
      <div className="absolute inset-0 signal-grid opacity-[0.12]" />
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            {Icon && <Icon className="h-4 w-4" />}
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>}
        </div>
        {action}
      </div>
    </section>
  );
}
