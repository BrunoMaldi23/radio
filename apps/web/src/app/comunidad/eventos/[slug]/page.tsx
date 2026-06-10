import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, UsersRound } from 'lucide-react';
import { AttendButton } from '@/components/community-actions';
import { api } from '@/lib/api';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function imageOf(value: string | null | undefined) {
  return value ?? null;
}

function formatDate(value: string | null) {
  if (!value) return 'Publicado por la radio';
  return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await api.articleBySlug(slug).catch(() => null);

  if (!event || event.category !== 'Eventos' || event.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6">
      <Link className="community-back-link community-back-link-compact" href="/comunidad">
        <ArrowLeft className="h-4 w-4" />
        Volver a comunidad
      </Link>

      <article className="community-event-detail">
        <div className="relative min-h-[430px] overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#1c1917,#292524)] text-white">
          {imageOf(event.coverUrl) && <img src={imageOf(event.coverUrl)!} alt="" className="absolute inset-0 h-full w-full object-cover opacity-72" />}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(2,6,23,0.55),rgba(2,6,23,0.12))]" />
          <div className="relative flex min-h-[430px] max-w-3xl flex-col justify-end p-6 sm:p-10">
            <span className="community-kicker w-fit">
              <CalendarDays className="h-4 w-4" />
              Evento comunidad
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">{event.title}</h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-200">{event.excerpt}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <AttendButton articleId={event.id} initialCount={event.attendees ?? 0} />
              <span className="community-detail-chip">
                <UsersRound className="h-4 w-4" />
                {event.attendees ?? 0} asistentes
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-7">
          <section
            className="community-copy"
            dangerouslySetInnerHTML={{ __html: event.body || `<p>${event.excerpt}</p>` }}
          />
          <aside className="community-detail-aside">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Fecha de publicacion</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formatDate(event.publishedAt)}</p>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
              <MapPin className="h-5 w-5 text-amber-300" />
              <p className="text-sm font-bold leading-6 text-slate-200">Radio Labranza FM+ compartira los detalles oficiales desde sus canales.</p>
            </div>
          </aside>
        </div>
      </article>
    </main>
  );
}
