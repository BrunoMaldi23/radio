'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Radio, Tv, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/noticias', label: 'Noticias' },
  { href: '/lo-nuevo', label: 'Lo nuevo' },
  { href: '/mejores-momentos', label: 'Mejores momentos' },
  { href: '/programas', label: 'Programas' },
  { href: '/concursos', label: 'Concursos' },
  { href: '/frecuencia', label: 'Frecuencia' }
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-40 w-full border-b border-amber-300/30 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/25 backdrop-blur-2xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-12 w-[132px] place-items-center rounded-lg border border-amber-200/40 bg-white px-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)] sm:w-[160px]">
            <Image alt="Radio Labranza FM+" className="max-h-9 w-auto object-contain" height={52} priority src="/logo-radio.png" width={210} />
          </span>
          <span className="sr-only">Radio Labranza FM+ 107.5</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="h-9 rounded-full px-3 text-sm font-black text-slate-200 hover:bg-white/10 hover:text-amber-200">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="h-10 rounded-full bg-amber-400 px-4 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/30 hover:bg-amber-300">
            <Link href="/tv">
              <Radio className="h-4 w-4 sm:hidden" />
              <Tv className="hidden h-4 w-4 sm:block" />
              <span className="hidden sm:inline">En Vivo</span>
              <Zap className="hidden h-3.5 w-3.5 sm:block" />
            </Link>
          </Button>
          <button
            aria-label={open ? 'Cerrar menu' : 'Abrir menu'}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white lg:hidden"
            onClick={() => setOpen((current) => !current)}
            type="button"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-amber-200"
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link className="rounded-md px-3 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 hover:text-amber-200" href="/tv" onClick={() => setOpen(false)}>
            En Vivo
          </Link>
        </nav>
      )}
    </header>
  );
}
