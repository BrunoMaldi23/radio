'use client';

import { fallbackImage } from '@/lib/content-mappers';

type Program = {
  name: string;
  host: string;
  schedule: string;
  imageUrl: string;
};

type ProgramCardProps = {
  program: Program;
};

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-teal-300/70 hover:shadow-[0_22px_60px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
          src={program.imageUrl}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/55 to-transparent" />
      </div>
      <div className="grid gap-2 p-5">
        <h3 className="text-xl font-black text-slate-950">{program.name}</h3>
        <p className="text-sm font-semibold text-slate-600">{program.host}</p>
        <p className="rounded-md bg-slate-950 px-3 py-2 text-sm font-black text-amber-200 ring-1 ring-slate-900/10">{program.schedule}</p>
      </div>
    </article>
  );
}
