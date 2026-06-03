import { Mic2 } from 'lucide-react';
import { ProgramCard } from '@/components/program-card';
import { PublicPageHero } from '@/components/public-page-hero';
import { api } from '@/lib/api';
import { mapProgram } from '@/lib/content-mappers';

async function getPrograms() {
  try {
    const apiPrograms = await api.programsPublic();
    return apiPrograms.map(mapProgram);
  } catch {
    return [];
  }
}

export default async function ProgramsPage() {
  const publicPrograms = await getPrograms();

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Voces de Labranza"
        icon={Mic2}
        title="Programas"
        description="Conoce la parrilla, horarios y conductores que acompanan cada jornada."
      />
      {publicPrograms.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {publicPrograms.map((program) => (
            <ProgramCard key={program.name} program={program} />
          ))}
        </div>
      ) : (
        <div className="radio-panel rounded-lg p-6 text-sm font-semibold text-slate-600">
          Aun no hay programas cargados.
        </div>
      )}
    </div>
  );
}
