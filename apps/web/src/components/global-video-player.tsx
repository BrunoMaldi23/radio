'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ExternalLink, Maximize2, Minimize2, PictureInPicture2, RadioTower } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/player-store';

const hlsUrl = process.env.NEXT_PUBLIC_TV_HLS_URL || '';

export function GlobalVideoPlayer() {
  const pathname = usePathname();
  const { videoMode } = usePlayerStore();
  const playerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isRanking = pathname === '/ranking';
  const isTv = pathname === '/tv';
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const video = videoRef.current;

    if (!video || videoMode === 'AUDIO_ONLY' || (!isRanking && !isTv)) {
      return;
    }

    let cleanup: () => void = () => undefined;
    setIsVideoReady(false);

    async function attachHls() {
      if (!video) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        cleanup = () => {
          video.removeAttribute('src');
          video.load();
        };
        return;
      }

      const Hls = (await import('hls.js')).default;
      if (!Hls.isSupported()) {
        return;
      }

      const hls = new Hls({
        lowLatencyMode: false,
        liveSyncDuration: 6,
        liveMaxLatencyDuration: 18,
        maxLiveSyncPlaybackRate: 1.15,
        backBufferLength: 20,
        maxBufferLength: 12
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      cleanup = () => hls.destroy();
    }

    void attachHls();
    return () => cleanup();
  }, [isRanking, isTv, videoMode]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await player.requestFullscreen();
  }

  async function openPictureInPicture() {
    const video = videoRef.current;
    if (
      !video ||
      !document.pictureInPictureEnabled ||
      video.disablePictureInPicture ||
      video.readyState < HTMLMediaElement.HAVE_METADATA
    ) {
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }

      await video.requestPictureInPicture();
    } catch {
      setIsVideoReady(false);
    }
  }

  if (videoMode === 'AUDIO_ONLY' || isAdmin || (!isRanking && !isTv)) {
    return null;
  }

  return (
    <section
      ref={playerRef}
      className={cn(
        'video-player-shell overflow-hidden border border-white/20 bg-slate-950 text-white transition-all duration-300',
        isRanking
          ? 'fixed bottom-28 right-4 z-50 h-[11.25rem] w-80 rounded-lg shadow-2xl'
          : cn(
              'flex w-full flex-col rounded-lg shadow-2xl shadow-slate-950/25',
              isTv ? 'max-w-none' : 'mx-auto mb-8 max-w-5xl'
            )
      )}
    >
      <div className={cn('relative aspect-video w-full bg-slate-950', !isRanking && 'min-h-[220px] sm:min-h-[360px]')}>
        <div className="absolute inset-0 signal-grid opacity-[0.16]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(9,15,28,0.98)_0%,rgba(15,23,42,0.92)_48%,rgba(19,78,74,0.82)_100%)]" />
        <video
          ref={videoRef}
          autoPlay
          className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-300', isVideoReady ? 'opacity-100' : 'opacity-0')}
          controls={isTv}
          muted
          onCanPlay={() => setIsVideoReady(true)}
          onError={() => setIsVideoReady(false)}
          playsInline
        />
        <div className={cn('absolute inset-0 grid place-items-center transition-opacity duration-300', isVideoReady && 'opacity-0')}>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-md bg-white/10 ring-1 ring-white/15">
              <RadioTower className="h-7 w-7 text-teal-300" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-teal-200">Preparando senal</p>
              {!isRanking && <h1 className="mt-2 text-3xl font-bold sm:text-5xl">Radio Labranza FM+ TV</h1>}
              {!isRanking && <p className="mt-2 text-xs text-zinc-300">Conectando con la transmision en vivo.</p>}
            </div>
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-rose-500 px-2 py-1 text-xs font-bold uppercase tracking-normal shadow-lg shadow-rose-950/30">
          Vivo
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            aria-label="Abrir TV"
            className="grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75"
            onClick={() => window.open('/tv', '_self')}
            type="button"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            aria-label="Picture in Picture"
            className="hidden h-9 w-9 place-items-center rounded-md border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75 disabled:cursor-not-allowed disabled:opacity-45 sm:grid"
            disabled={!isVideoReady}
            onClick={() => void openPictureInPicture()}
            type="button"
          >
            <PictureInPicture2 className="h-4 w-4" />
          </button>
          <button
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-black/55 text-white backdrop-blur hover:bg-black/75"
            onClick={() => void toggleFullscreen()}
            type="button"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
