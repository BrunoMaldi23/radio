'use client';

import { toast } from 'sonner';
import { FormEvent, useState } from 'react';
import { FileImage, Pencil, Save, Trash2, Tv, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { api, type Program } from '@/lib/api';

function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

async function resolveImage(token: string, form: FormData): Promise<string | undefined> {
  const file = form.get('imageFile');
  const url = optionalText(form.get('imageUrl'));
  if (file instanceof File && file.size > 0) {
    const uploaded = await api.uploadImage(token, file);
    return uploaded.url;
  }
  return url;
}

const statusColor: Record<string, string> = {
  ACTIVE: 'admin-badge-emerald',
  PAUSED: 'admin-badge-amber',
  ARCHIVED: 'admin-badge-rose',
};

export default function AdminProgramasPage() {
  const { token, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const activeCount = adminData.programs.filter((program) => program.status === 'ACTIVE').length;
  const pausedCount = adminData.programs.filter((program) => program.status === 'PAUSED').length;
  const archivedCount = adminData.programs.filter((program) => program.status === 'ARCHIVED').length;

  async function run(action: () => Promise<unknown>, ok: string) {
    setSaving(true);
    try { await action(); toast.success(ok); await refreshContent(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name'));
    setSaving(true);
    try {
      const imageUrl = await resolveImage(token, form);
      await api.createProgram(token, {
        name, slug: slugify(String(form.get('slug')) || name),
        host: String(form.get('host')), description: String(form.get('description')),
        schedule: String(form.get('schedule')), imageUrl, status: 'ACTIVE',
      });
      (e.target as HTMLFormElement).reset();
      toast.success('Programa guardado.');
      await refreshContent();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleEditSave(program: Program, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name'));
    setSaving(true);
    try {
      const imageUrl = await resolveImage(token, form);
      await api.updateProgram(token, program.id, {
        name, slug: slugify(String(form.get('slug')) || name),
        host: String(form.get('host')), description: String(form.get('description')),
        schedule: String(form.get('schedule')),
        imageUrl: imageUrl ?? program.imageUrl,
        status: String(form.get('status')) as Program['status'],
      });
      setEditingId(null);
      toast.success('Programa actualizado.');
      await refreshContent();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid gap-6">
      <div className="relative overflow-hidden rounded-xl border border-amber-300/30 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white shadow-warmLg sm:p-6">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-teal-400/20 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-amber-400 text-slate-950 shadow-lg shadow-black/20">
              <Tv className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Parrilla radial</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Programas</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Gestiona los espacios al aire, conductores, horarios, imagenes y estado editorial de cada programa.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-2xl font-black text-emerald-200">{activeCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-emerald-200/70">Activos</p>
            </div>
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3">
              <p className="text-2xl font-black text-amber-200">{pausedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-amber-200/70">Pausados</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black text-zinc-300">{archivedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-zinc-400">Archivados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
              <Tv className="h-4 w-4 text-brand-500" />
              Programas registrados
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Controla que sale al aire y que queda pausado o archivado.</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
            {adminData.programs.length} registros
          </span>
        </div>

        {adminData.programs.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center p-6 text-sm text-zinc-400">
            No hay programas. Crea el primero abajo.
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
            {adminData.programs.map((program) => (
              <div key={program.id} className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_20px_54px_rgba(15,23,42,0.12)]">
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto]">
                  <div className="flex items-start gap-4">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                      program.status === 'ACTIVE' ? 'bg-brand-50 text-brand-600' :
                      program.status === 'PAUSED' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      <Tv className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="truncate text-lg font-black text-zinc-950">{program.name}</p>
                        <span className={`admin-badge ${statusColor[program.status] ?? 'admin-badge-zinc'}`}>
                          {program.status === 'ACTIVE' ? 'Activo' : program.status === 'PAUSED' ? 'Pausado' : 'Archivado'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-brand-700">{program.schedule}</p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {program.host && <>{program.host} &middot; </>}
                        {program.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    {program.status !== 'ACTIVE' && (
                      <Button className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all" disabled={saving} onClick={() => run(() => api.updateProgram(token, program.id, { status: 'ACTIVE' }), 'Programa activado.')} type="button" variant="outline">
                        <Play className="h-3.5 w-3.5" />Activar
                      </Button>
                    )}
                    {program.status === 'ACTIVE' && (
                      <Button className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all" disabled={saving} onClick={() => run(() => api.updateProgram(token, program.id, { status: 'PAUSED' }), 'Programa pausado.')} type="button" variant="outline">
                        <Pause className="h-3.5 w-3.5" />Pausar
                      </Button>
                    )}
                    <Button
                      className={`transition-all ${editingId === program.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'}`}
                      disabled={saving}
                      onClick={() => setEditingId(editingId === program.id ? null : program.id)}
                      type="button"
                      variant="outline"
                     
                    >
                      <Pencil className="h-3.5 w-3.5" />Editar
                    </Button>
                    <Button
                      className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                      disabled={saving}
                      onClick={() => { if (window.confirm('Eliminar este programa?')) run(() => api.deleteProgram(token, program.id), 'Programa eliminado.'); }}
                      type="button"
                      variant="outline"
                     
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Edit Panel */}
                {editingId === program.id && (
                  <div className="border-t border-brand-100 bg-gradient-to-b from-brand-50/50 to-white px-5 py-5">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100">
                        <Pencil className="h-3.5 w-3.5 text-brand-700" />
                      </span>
                      <span className="text-sm font-bold text-brand-800">Editando: {program.name}</span>
                    </div>
                    <form className="grid gap-5" onSubmit={(e) => handleEditSave(program, e)}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input className="admin-input" defaultValue={program.name} name="name" placeholder="Nombre" required />
                        <input className="admin-input" defaultValue={program.slug} name="slug" placeholder="Slug" />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input className="admin-input" defaultValue={program.host} name="host" placeholder="Conductor/a" required />
                        <input className="admin-input" defaultValue={program.schedule} name="schedule" placeholder="Horario" required />
                      </div>
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <input className="admin-input" defaultValue={program.imageUrl ?? ''} name="imageUrl" placeholder="https://..." type="url" />
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-600 transition hover:border-brand-400 hover:bg-brand-50">
                          <FileImage className="h-4 w-4 text-brand-600" />Cambiar imagen
                          <input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" name="imageFile" type="file" />
                        </label>
                      </div>
                      <textarea className="admin-input min-h-28 resize-y leading-relaxed" defaultValue={program.description} name="description" placeholder="Descripcion" required />
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-white p-4">
                        <select className="admin-input w-auto bg-white text-sm" defaultValue={program.status} name="status">
                          <option value="ACTIVE">Activo</option>
                          <option value="PAUSED">Pausado</option>
                          <option value="ARCHIVED">Archivado</option>
                        </select>
                        <div className="flex flex-wrap gap-2">
                          <Button className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100" disabled={saving} onClick={() => setEditingId(null)} type="button" variant="outline">Cancelar</Button>
                          <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-brand-900/20 hover:shadow-lg hover:shadow-brand-900/30 transition-all" disabled={saving} type="submit">
                            <Save className="h-4 w-4" />Guardar
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Program */}
      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-100/60">
            <Tv className="h-4 w-4 text-brand-600" />
          </span>
          <h2 className="text-base font-bold text-zinc-900">Nuevo programa</h2>
        </div>
        <form className="grid gap-5 p-4 sm:p-6" onSubmit={handleCreate}>
          <input className="admin-input" name="name" placeholder="Nombre del programa" required />
          <input className="admin-input" name="slug" placeholder="Slug opcional" />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="admin-input" name="host" placeholder="Conductor/a" required />
            <input className="admin-input" name="schedule" placeholder="Horario" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-700">Imagen desde URL</span>
              <input className="admin-input" name="imageUrl" placeholder="https://..." type="url" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-700">Subir imagen</span>
              <span className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 text-sm font-semibold text-zinc-600 transition hover:border-brand-400 hover:bg-brand-50">
                <FileImage className="h-4 w-4 text-brand-600" />JPG, PNG, WEBP o GIF hasta 5 MB
                <input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" name="imageFile" type="file" />
              </span>
            </label>
          </div>
          <textarea className="admin-input min-h-32 resize-y leading-relaxed" name="description" placeholder="Descripcion" required />
          <div className="flex justify-end border-t border-zinc-100 pt-4">
            <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-brand-900/20 hover:shadow-xl hover:shadow-brand-900/30 transition-all" disabled={saving} type="submit">
              <Save className="h-4 w-4" />{saving ? 'Guardando...' : 'Guardar programa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


