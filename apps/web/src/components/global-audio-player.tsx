'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Pause, Play, Share2, Tv, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/player-store';

const icecastUrl = process.env.NEXT_PUBLIC_ICECAST_URL || '';

export function GlobalAudioPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [notice, setNotice] = useState('');
  const { currentTrack, isPlaying, isLive, setPlaying, volume, setVolume, videoMode, setVideoMode } =
    usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => setPlaying(false));
      return;
    }

    audio.pause();
  }, [isPlaying, setPlaying]);

  function handleVideoMode() {
    if (videoMode === 'AUDIO_ONLY') {
      setVideoMode('FULLSCREEN');
      if (pathname !== '/tv') {
        router.push('/tv');
      }
      return;
    }

    setVideoMode('AUDIO_ONLY');
  }

  async function shareLive() {
    const shareUrl = 'https://radio-labranza-fm.vercel.app';
    const title = 'Radio Labranza FM+ 107.5';

    try {
      if (navigator.share) {
        await navigator.share({ title, text: 'Escucha Radio Labranza FM+ en vivo', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setNotice('Enlace copiado');
        window.setTimeout(() => setNotice(''), 1800);
      }
    } catch {
      setNotice('');
    }
  }

  const coverUrl = currentTrack.coverUrl || '/logo-radio.png';

  return (
    <aside className="fixed bottom-0 left-0 z-50 w-full border-t border-amber-300/40 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      <audio preload="none" ref={audioRef} src={icecastUrl} />
      <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:min-h-[84px] sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-amber-200/40 bg-white p-1.5 shadow-lg shadow-black/30 ring-1 ring-white/10 sm:h-14 sm:w-14">
            <img src={coverUrl} alt="" className="max-h-full max-w-full object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">Senal en vivo</p>
            <p className="truncate text-sm font-black leading-tight text-white sm:text-base">{currentTrack.title}</p>
            <p className="truncate text-xs font-semibold text-slate-300">{currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sm:justify-center">
          <Button
            aria-label={isPlaying ? 'Pausar transmision' : 'Reproducir transmision'}
            className="h-11 w-11 rounded-full bg-amber-400 p-0 text-slate-950 shadow-lg shadow-amber-950/30 hover:bg-amber-300"
            onClick={() => setPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
          </Button>
          {isLive && (
            <span className="inline-flex h-8 items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/20 px-3 text-xs font-black uppercase tracking-normal text-rose-100">
              <span className="h-2 w-2 rounded-full bg-rose-400 live-dot" />
              Live
            </span>
          )}
        </div>

        <div className="hidden items-center justify-start gap-3 sm:flex sm:justify-end">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 md:flex">
            <Volume2 className="h-4 w-4 text-amber-200" />
            <input
              aria-label="Volumen"
              className="h-1.5 w-28 accent-amber-400"
              max={100}
              min={0}
              onChange={(event) => setVolume(Number(event.target.value))}
              type="range"
              value={volume}
            />
          </div>
          <Button
            className="h-9 border-white/10 bg-white/10 px-3 text-sm font-bold text-white hover:bg-white/20"
            onClick={handleVideoMode}
            variant="outline"
          >
            <Tv className="h-4 w-4" />
            {videoMode === 'AUDIO_ONLY' ? 'Ver TV' : 'Solo audio'}
          </Button>
          <Button aria-label="Compartir" className="h-9 w-9 border-white/10 bg-white/10 p-0 text-white hover:bg-white/20" onClick={() => void shareLive()} variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {notice && (
        <div className="absolute bottom-full right-4 mb-2 rounded-md border border-emerald-400/30 bg-emerald-950 px-3 py-2 text-xs font-semibold text-emerald-100">
          {notice}
        </div>
      )}
    </aside>
  );
}
