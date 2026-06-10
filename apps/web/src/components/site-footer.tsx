import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Music2, Phone, Youtube } from 'lucide-react';

const footerLinks = [
  { href: '/noticias', label: 'Noticias' },
  { href: '/lo-nuevo', label: 'Exitos 90,2000' },
  { href: '/mejores-momentos', label: 'Rankings semanal' },
  { href: '/comunidad', label: 'Comunidad' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-900/10 bg-slate-950 px-4 pb-32 pt-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <span className="inline-grid rounded-lg bg-white p-3">
            <Image alt="Radio Labranza FM+" className="h-14 w-auto object-contain" height={80} src="/logo-radio.png" width={260} />
          </span>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Radio Labranza FM+ 107.5, musica, compania y entretencion en vivo.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Youtube, Facebook, Music2].map((Icon, index) => (
              <span className="grid h-9 w-9 place-items-center rounded-md bg-white/10 text-amber-300 ring-1 ring-white/20" key={index}>
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <nav className="grid content-start gap-2">
          {footerLinks.map((item) => (
            <Link
              className="text-sm font-bold text-slate-300 hover:text-amber-300"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="grid content-start gap-3 text-sm text-slate-300">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-300" />
            Labranza, Temuco, Chile
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-teal-300" />
            (+56 2) 2810 80 10
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-300" />
            contacto@radiolabranza.cl
          </p>
        </div>
      </div>
    </footer>
  );
}
