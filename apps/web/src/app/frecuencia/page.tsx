import { MapPin, Radio, Smartphone, Tv } from 'lucide-react';
import { PublicPageHero } from '@/components/public-page-hero';
import { api } from '@/lib/api';

export default async function FrequencyPage() {
  const frequencies = await api.frequencies().catch(() => []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8">
      <PublicPageHero
        eyebrow="Donde escuchar"
        icon={Radio}
        title="Frecuencia"
        description="Encuentra la senal disponible por ciudad, online y TV digital."
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="radio-panel rounded-lg p-5">
          {frequencies.length ? (
            <div className="grid gap-3">
              {frequencies.map((item) => (
                <div className="grid gap-1 rounded-lg border border-slate-900/10 bg-white/70 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={item.id}>
                  <span className="flex items-center gap-3 font-bold text-slate-800">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    {item.city}
                  </span>
                  <span className="rounded-md bg-slate-950 px-3 py-1 font-black text-amber-200 ring-1 ring-slate-900/10">{item.dial}</span>
                  {item.description && <p className="text-sm text-slate-500 sm:col-span-2">{item.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md bg-white/70 p-4 text-sm font-semibold text-slate-600">
              Aun no hay frecuencias cargadas.
            </div>
          )}
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            { title: 'Radio online', icon: Radio },
            { title: 'Labranza TV', icon: Tv },
            { title: 'App movil', icon: Smartphone }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article className="radio-panel rounded-lg p-5 transition hover:-translate-y-1 hover:border-teal-300" key={item.title}>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-100 text-teal-800 ring-1 ring-teal-200">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-lg font-black text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Senal preparada para integracion HLS, audio y apps.</p>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
