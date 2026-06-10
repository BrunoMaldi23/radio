'use client';

import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Camera, Images, Radio } from 'lucide-react';
import { GalleryWithLightbox } from '@/components/gallery-lightbox';
import { api, type Article } from '@/lib/api';
import { useEffect, useState } from 'react';

function imageOf(item: Article | undefined | null) {
  return item?.coverUrl ?? null;
}

function formatDate(value: string | null) {
  if (!value) return 'Muy pronto';
  return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sortByFreshness(items: Article[]) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.publishedAt ?? a.updatedAt).getTime();
    const bDate = new Date(b.publishedAt ?? b.updatedAt).getTime();
    return bDate - aDate;
  });
}

export default function ComunidadPage() {
  const [events, setEvents] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<Article[]>([]);

  useEffect(() => {
    Promise.all([
      api.articles('Eventos').catch(() => []),
      api.articles('Galeria').catch(() => []),
    ]).then(([eventsRaw, galleryRaw]) => {
      setEvents(sortByFreshness(eventsRaw));
      setGallery(sortByFreshness(galleryRaw));
    });
  }, []);

  const heroEvent = events[0];
  const nextEvents = events.slice(0, 5);
  const featuredGallery = gallery[0];

  return (
    <main className="community-page mx-auto grid max-w-7xl gap-8">
      <section className="community-hero">
        <div className="community-hero-copy">
          <span className="community-kicker">
            <Radio className="h-4 w-4" />
            Comunidad en vivo
          </span>
          <h1>Lo que pasa en Labranza, contado por su gente.</h1>
          <p>
            Eventos oficiales cargados por la radio y una galeria viva para guardar, compartir y celebrar los momentos de la comunidad.
          </p>
          <div className="community-hero-actions">
            {heroEvent ? (
              <Link className="community-primary-link" href={`/comunidad/eventos/${heroEvent.slug}`}>
                Ver evento destacado
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="community-primary-link is-disabled">Eventos en preparacion</span>
            )}
            <a className="community-secondary-link" href="#galeria">
              Ver galeria
              <Images className="h-4 w-4" />
            </a>
          </div>
        </div>

        <article className="community-hero-event">
          {imageOf(heroEvent) ? <img src={imageOf(heroEvent)!} alt="" /> : (
            <div className="absolute inset-0 grid place-items-center bg-stone-800">
              <Camera className="h-10 w-10 text-stone-600" />
            </div>
          )}
          <div className="community-hero-overlay" />
          <div className="community-hero-event-content">
            <span className="community-float-badge">
              <CalendarDays className="h-4 w-4" />
              Evento destacado
            </span>
            <h2>{heroEvent?.title ?? 'Pronto anunciaremos nuevas actividades'}</h2>
            <p>{heroEvent?.excerpt ?? 'La agenda comunitaria se actualiza desde el panel de administracion.'}</p>
            <div className="community-hero-meta">
              <span>{heroEvent ? formatDate(heroEvent.publishedAt) : 'Sin fecha'}</span>
              <span>{heroEvent?.attendees ?? 0} asistentes</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5">
        <div className="community-section-heading">
          <div>
            <p>Agenda</p>
            <h2>Eventos para encontrarnos</h2>
          </div>
          <span>{events.length} publicados</span>
        </div>

        {events.length === 0 ? (
          <div className="community-empty">Aun no hay eventos publicados. Cuando el admin cargue uno, aparecera aqui con su detalle.</div>
        ) : (
          <div className="community-event-list">
            {nextEvents.map((event, index) => (
              <Link className="community-event-row" href={`/comunidad/eventos/${event.slug}`} key={event.id}>
                <span className="community-row-number">{String(index + 1).padStart(2, '0')}</span>
                {imageOf(event) ? <img src={imageOf(event)!} alt="" /> : (
                  <div className="flex h-[74px] w-[88px] shrink-0 items-center justify-center rounded-[14px] bg-stone-100">
                    <CalendarDays className="h-5 w-5 text-stone-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3>{event.title}</h3>
                  <p>{event.excerpt}</p>
                  <div className="community-row-meta">
                    <span>{formatDate(event.publishedAt)}</span>
                    <span>{event.attendees ?? 0} asistentes</span>
                  </div>
                </div>
                <span className="community-row-cta">
                  Detalle
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5" id="galeria">
        <div className="community-section-heading">
          <div>
            <p>Galeria</p>
            <h2>Momentos que quedan</h2>
          </div>
          <span>{gallery.length} imagenes</span>
        </div>

        {gallery.length === 0 ? (
          <div className="community-empty">Aun no hay imagenes publicadas. La galeria se llenara desde el admin en tiempo real.</div>
        ) : (
          <div className="community-gallery-layout">
            <GalleryWithLightbox
              items={gallery.map((item) => ({
                id: item.id,
                title: item.title,
                excerpt: item.excerpt,
                imageUrl: imageOf(item),
                likes: item.likes ?? 0,
                slug: item.slug,
              }))}
            />
          </div>
        )}
      </section>
    </main>
  );
}
