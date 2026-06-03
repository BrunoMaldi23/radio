'use client';

import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  ListMusic,
  Loader2,
  Newspaper,
  Radio,
  RefreshCw,
  Tv,
  TrendingUp,
  Users,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { StreamRuntimePanel } from '@/components/stream-runtime-panel';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';

function StatCard({ label, value, href, icon: Icon, trend }: {
  label: string; value: number; href: string; icon: React.ComponentType<{ className?: string }>; trend?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/70 hover:shadow-[0_24px_64px_rgba(15,23,42,0.13)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-teal-300 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-amber-300 ring-1 ring-slate-900/10">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-3xl font-black tracking-tight text-slate-950">{value}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {trend && (
            <span className="flex items-center gap-0.5 text-xs font-black text-teal-700">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { adminData, user, refreshContent, loading } = useAdminAuth();

  const publishedArticles = adminData.articles.filter((a) => a.status === 'PUBLISHED').length;
  const draftArticles = adminData.articles.filter((a) => a.status === 'DRAFT').length;
  const activePrograms = adminData.programs.filter((p) => p.status === 'ACTIVE').length;
  const activeTracks = adminData.ranking.filter((t) => t.isActive).length;

  const recentArticles = [...adminData.articles]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:gap-8">
      {/* Hero Header */}
      <div className="ink-panel relative overflow-hidden rounded-xl text-white">
        <div className="absolute inset-0 signal-grid opacity-[0.12]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="relative flex flex-col justify-between gap-5 p-4 sm:p-7 lg:flex-row lg:items-start">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/30 sm:h-16 sm:w-16">
              <LayoutDashboard className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Centro de control</p>
              <h1 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                Bienvenido, <span className="text-amber-200">{user?.name}</span>
              </h1>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />{publishedArticles} publicados</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-300" />{draftArticles} borradores</span>
                <span className="flex items-center gap-1.5"><Tv className="h-3.5 w-3.5 text-teal-300" />{activePrograms} programas activos</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-amber-300" />{activeTracks} canciones en ranking</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white transition-all hover:bg-white/20">
              <a href="https://radio-labranza-fm.vercel.app" rel="noreferrer" target="_blank">
                <ExternalLink className="h-4 w-4" />
                Ver sitio
              </a>
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/10 text-white transition-all hover:bg-white/20"
              disabled={loading}
              onClick={() => refreshContent()}
              type="button"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sincronizar
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Noticias" href="/admin/contenido" value={adminData.articles.filter((a) => a.category === 'Noticias').length} icon={Newspaper} trend="+12%" />
        <StatCard label="Programas" href="/admin/programas" value={adminData.programs.length} icon={Tv} trend={activePrograms > 0 ? `${activePrograms} activos` : undefined} />
        <StatCard label="Ranking" href="/admin/ranking" value={adminData.ranking.length} icon={TrendingUp} trend={activeTracks > 0 ? `${activeTracks} activas` : undefined} />
        <StatCard label="Usuarios" href="/admin/usuarios" value={adminData.users.length} icon={Users} />
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Stream Panel */}
        <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
          <StreamRuntimePanel />
        </div>

        {/* Right Column */}
        <div className="grid gap-6 content-start">
          {/* Quick Actions */}
          <div className="rounded-lg border border-slate-900/10 bg-white/80 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Acceso rapido
            </h2>
            <div className="mt-4 grid gap-1.5">
              {[
                { label: 'Nuevo articulo', href: '/admin/contenido', icon: FileText, desc: 'Redacta y publica contenido' },
                { label: 'Agregar programa', href: '/admin/programas', icon: Tv, desc: 'Crea un nuevo programa' },
                { label: 'Cancion al ranking', href: '/admin/ranking', icon: ListMusic, desc: 'Agrega una cancion' },
                { label: 'Estado de senales', href: '/admin/transmision', icon: Radio, desc: 'Monitorea transmision' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg border border-slate-900/10 bg-white/60 px-4 py-3 text-sm transition-all duration-200 hover:border-amber-300 hover:bg-amber-50"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-950 text-amber-300 transition-colors duration-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-amber-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Articles */}
          <div className="rounded-lg border border-slate-900/10 bg-white/80 p-5 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
              <Clock className="h-4 w-4 text-amber-600" />
              Actividad reciente
            </h2>
            <div className="mt-4 grid gap-2">
              {recentArticles.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No hay articulos recientes</p>
              ) : (
                recentArticles.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-amber-50">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${
                      a.status === 'PUBLISHED' ? 'bg-teal-500' :
                      a.status === 'DRAFT' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{a.title}</p>
                    <span className="text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleDateString('es-CL')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


