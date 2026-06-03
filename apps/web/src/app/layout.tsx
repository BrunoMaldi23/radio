import type { Metadata } from 'next';
import { RootLayoutClient } from '@/components/root-layout-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radio Labranza FM+ 107.5',
  description: 'Mas musica, compania y entretencion',
  icons: {
    icon: '/logo-radio.png',
    shortcut: '/logo-radio.png',
    apple: '/logo-radio.png'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
