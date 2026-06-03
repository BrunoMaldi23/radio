import { create } from 'zustand';

export type VideoMode = 'AUDIO_ONLY' | 'FULLSCREEN' | 'FLOATING';

type Track = {
  title: string;
  artist: string;
  coverUrl: string;
};

type PlayerState = {
  isPlaying: boolean;
  isLive: boolean;
  volume: number;
  videoMode: VideoMode;
  currentTrack: Track;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setVideoMode: (videoMode: VideoMode) => void;
  toggleVideoMode: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: true,
  isLive: true,
  volume: 72,
  videoMode: 'FULLSCREEN',
  currentTrack: {
    title: 'Senal en vivo',
    artist: 'Radio Labranza FM+ 107.5',
    coverUrl: '/logo-radio.png'
  },
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setVideoMode: (videoMode) => set({ videoMode }),
  toggleVideoMode: () => {
    const nextMode = get().videoMode === 'AUDIO_ONLY' ? 'FULLSCREEN' : 'AUDIO_ONLY';
    set({ videoMode: nextMode });
  }
}));
