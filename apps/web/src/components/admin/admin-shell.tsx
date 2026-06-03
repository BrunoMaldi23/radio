'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Gift,
  LayoutDashboard,
  ListMusic,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  MapPin,
  Radio,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Tv,
  Users,
  X,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/contenido', label: 'Contenido', icon: FileText },
  { href: '/admin/programas', label: 'Programas', icon: Tv },
  { href: '/admin/ranking', label: 'Ranking', icon: ListMusic },
  { href: '/admin/frecuencia', label: 'Frecuencia', icon: MapPin },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/transmision', label: 'Transmision', icon: Radio },
];

const NavItem = memo(function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-200 ${
        isActive
          ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/25'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {isActive && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-slate-950" />}
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-all duration-200 ${
        isActive ? 'bg-slate-950/10 text-slate-950' : 'bg-white/10 text-slate-400 group-hover:bg-white/15 group-hover:text-amber-300'
      }`}>
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </Link>
  );
});

const UserMenu = memo(function UserMenu() {
  const { logout } = useAdminAuth();

  return (
    <button
      onClick={logout}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#ff94a7]/40 bg-[#d7193f] px-3 text-sm font-bold text-white shadow-lg shadow-[#d7193f]/25 transition hover:border-[#ffc4cf]/70 hover:bg-[#b01032] hover:shadow-[#d7193f]/40"
      type="button"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesion
    </button>
  );
});

const AdminSidebar = memo(function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAdminAuth();

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),radial-gradient(circle_at_16%_0%,rgba(245,158,11,0.28),transparent_260px),radial-gradient(circle_at_92%_18%,rgba(20,184,166,0.16),transparent_220px),linear-gradient(180deg,#020617_0%,#111827_48%,#020617_100%)] bg-[size:34px_34px,34px_34px,auto,auto,auto]">
      <div className="border-b border-white/10 px-5 py-5">
        <span className="grid h-14 w-[164px] place-items-center rounded-lg bg-white px-3 shadow-lg shadow-black/30 ring-1 ring-amber-200/40">
          <Image
            alt="Radio Labranza FM+"
            className="h-9 w-auto object-contain"
            height={36}
            src="/logo-radio.png"
            width={130}
          />
        </span>
      </div>
      <nav className="admin-scroll flex-1 space-y-1 overflow-y-auto px-3 pt-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-300/70">Navegacion</p>
        {sidebarLinks.map((link) => {
          if (link.href === '/admin/usuarios') {
            if (user?.role !== 'ADMIN') return null;
          }
          return (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              isActive={pathname === link.href}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-3 py-3">
        <UserMenu />
      </div>
    </aside>
  );
});

function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onLogin(email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error al iniciar sesion');
    } finally {
      setBusy(false);
    }
  }, [email, password, onLogin]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(245,158,11,0.34),transparent_360px),radial-gradient(circle_at_88%_12%,rgba(20,184,166,0.18),transparent_330px),linear-gradient(135deg,#020617,#111827_52%,#020617)] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:min-h-[620px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(245,158,11,0.2),transparent_260px),radial-gradient(circle_at_85%_30%,rgba(20,184,166,0.12),transparent_260px)]" />
          <div className="relative">
            <span className="inline-grid h-24 w-52 place-items-center rounded-xl bg-white px-5 shadow-2xl shadow-black/35 ring-1 ring-amber-300/40">
              <Image alt="Radio Labranza FM+" className="h-auto w-40 object-contain" height={70} priority src="/logo-radio.png" width={230} />
            </span>
            <p className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="h-4 w-4" />
              Panel privado
            </p>
            <h1 className="mt-4 max-w-xl text-5xl font-black leading-none tracking-tight">Centro de control Labranza FM+</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
              Gestiona contenidos, programas, ranking, frecuencias y transmision desde una cabina digital preparada para operar en vivo.
            </p>
          </div>
          <div className="relative grid gap-3">
            {[
              { label: 'Senal', value: 'Radio y TV', icon: RadioTower },
              { label: 'Contenido', value: 'CMS activo', icon: FileText },
              { label: 'Seguridad', value: 'Acceso privado', icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-4" key={item.label}>
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-400 text-slate-950">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                    <span className="block text-sm font-black text-white">{item.value}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="grid content-center p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-24 w-44 place-items-center rounded-xl bg-white px-5 shadow-2xl shadow-black/35 ring-1 ring-amber-300/40 lg:hidden">
            <Image alt="Radio Labranza FM+" className="h-auto w-36 object-contain" height={70} priority src="/logo-radio.png" width={210} />
          </span>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-amber-300 lg:mt-0">Acceso autorizado</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Iniciar sesion</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Entra al panel para administrar la radio en tiempo real.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5 rounded-xl border border-white/10 bg-slate-950/70 p-7 shadow-2xl shadow-black/45">
          {error && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-300">Correo electronico</label>
            <input
              className="h-12 w-full rounded-lg border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white outline-none placeholder:text-slate-500 transition hover:border-white/20 focus:border-amber-400 focus:bg-white/20 focus:ring-4 focus:ring-amber-400/20"
              type="email"
              placeholder="tu@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-300">Contrasena</label>
            <input
              className="h-12 w-full rounded-lg border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white outline-none placeholder:text-slate-500 transition hover:border-white/20 focus:border-amber-400 focus:bg-white/20 focus:ring-4 focus:ring-amber-400/20"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={busy} className="mt-2 h-12 w-full rounded-lg bg-amber-400 text-sm font-black text-slate-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-950/40">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {busy ? 'Ingresando...' : 'Entrar al panel'}
          </Button>
        </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { token, loading, login } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-amber-400" />
          <p className="mt-4 text-sm font-medium text-zinc-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 lg:flex">
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:z-30 lg:block lg:h-full lg:w-64 lg:shrink-0 lg:shadow-2xl lg:shadow-black/20">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
          <div className="relative h-full w-[min(18rem,86vw)] shadow-2xl shadow-black/40">
            <button
              aria-label="Cerrar menu"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-slate-950/75 text-white shadow-lg backdrop-blur transition hover:border-amber-300/60 hover:text-amber-300"
              onClick={() => setSidebarOpen(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="admin-bg min-h-screen w-full lg:ml-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 text-white shadow-lg shadow-slate-950/25 backdrop-blur-xl lg:hidden">
          <Link href="/admin" className="grid h-10 w-36 place-items-center rounded-lg bg-white px-3 shadow-md shadow-black/20">
            <Image
              alt="Radio Labranza FM+"
              className="h-7 w-auto object-contain"
              height={28}
              src="/logo-radio.png"
              width={112}
            />
          </Link>
          <button
            aria-label="Abrir menu"
            className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/25 transition hover:bg-amber-300"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminAuthProvider>
  );
}
