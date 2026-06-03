'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { GlobalAudioPlayer } from '@/components/global-audio-player';
import { GlobalVideoPlayer } from '@/components/global-video-player';
import { SiteFooter } from '@/components/site-footer';
import { SiteNavbar } from '@/components/site-navbar';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <SiteNavbar />}
      <main className={`min-h-screen ${
        isAdmin
          ? 'p-0'
          : 'public-shell px-4 pb-28 pt-24 sm:px-6 lg:px-8'
      }`}>
        {!isAdmin && <GlobalVideoPlayer />}
        {children}
      </main>
      {!isAdmin && <SiteFooter />}
      {!isAdmin && <GlobalAudioPlayer />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e4e4e7',
            color: '#18181b',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}
