'use client';

import { toast } from 'sonner';
import { FormEvent, useState } from 'react';
import { FileImage, Pencil, Save, Trash2, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { api } from '@/lib/api';

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

async function resolveArtwork(token: string, form: FormData): Promise<string | undefined> {
  const file = form.get('artworkFile');
  const url = optionalText(form.get('artworkUrl'));
  if (file instanceof File && file.size > 0) {
    const uploaded = await api.uploadImage(token, file);
    return uploaded.url;
  }
  return url;
}

export default function AdminRankingPage() {
  const { token, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const activeCount = adminData.ranking.filter((track) => track.isActive).length;
  const hiddenCount = adminData.ranking.length - activeCount;
  const totalVotes = adminData.ranking.reduce((sum, track) => sum + track.votes, 0);

  async function run(action: () => Promise<unknown>, ok: string) {
    setSaving(true);
    try { await action(); toast.success(ok); await refreshContent(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const artworkUrl = await resolveArtwork(token, form);
      await api.createRankingTrack(token, {
        title: String(form.get('title')), artist: String(form.get('artist')),
        artworkUrl, isActive: true,
      });
      (e.target as HTMLFormElement).reset();
      toast.success('Cancion agregada al ranking.');
      await refreshContent();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleEditSave(trackId: number, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const track = adminData.ranking.find((t) => t.id === trackId)!;
      const artworkUrl = await resolveArtwork(token, form);
      await api.updateRankingTrack(token, trackId, {
        title: String(form.get('title')), artist: String(form.get('artist')),
        artworkUrl: artworkUrl ?? track.artworkUrl,
        isActive: form.get('isActive') === 'on',
      });
      setEditingId(null);
      toast.success('Cancion actualizada.');
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
              <TrendingUp className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Ranking musical</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Canciones</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Administra temas visibles, caratulas y votos del ranking que aparece en el sitio.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-2xl font-black text-emerald-200">{activeCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-emerald-200/70">Activas</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black text-zinc-300">{hiddenCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-zinc-400">Ocultas</p>
            </div>
            <div className="rounded-lg border border-brand-300/20 bg-brand-500/10 px-4 py-3">
              <p className="text-2xl font-black text-brand-200">{totalVotes}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-brand-200/70">Votos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              Canciones registradas
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Controla que canciones aparecen en el ranking publico.</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
            {adminData.ranking.length} registros
          </span>
        </div>

        {adminData.ranking.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center p-6 text-sm text-zinc-400">
            No hay canciones en el ranking. Agrega la primera abajo.
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
            {adminData.ranking.map((track) => (
              <div key={track.id} className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_20px_54px_rgba(15,23,42,0.12)]">
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto]">
                  <div className="flex items-start gap-4">
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-zinc-200/50" />
                    ) : (
                      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-900/20">
                        <TrendingUp className="h-7 w-7" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-lg font-black text-zinc-950">{track.title}</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-600">{track.artist}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {track.votes} votos
                        <span className={`ml-2 inline-block admin-badge ${track.isActive ? 'admin-badge-emerald' : 'admin-badge-zinc'}`}>
                          {track.isActive ? 'Activo' : 'Oculto'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    <Button
                      className={`transition-all ${track.isActive ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      disabled={saving}
                      onClick={() => run(() => api.updateRankingTrack(token, track.id, { isActive: !track.isActive }), track.isActive ? 'Ocultado del ranking.' : 'Visible en ranking.')}
                      type="button"
                      variant="outline"
                     
                    >
                      {track.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {track.isActive ? 'Ocultar' : 'Activar'}
                    </Button>
                    <Button
                      className={`transition-all ${editingId === track.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'}`}
                      disabled={saving}
                      onClick={() => setEditingId(editingId === track.id ? null : track.id)}
                      type="button"
                      variant="outline"
                     
                    >
                      <Pencil className="h-3.5 w-3.5" />Editar
                    </Button>
                    <Button
                      className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                      disabled={saving}
                      onClick={() => { if (window.confirm('Eliminar esta cancion del ranking?')) run(() => api.deleteRankingTrack(token, track.id), 'Cancion eliminada.'); }}
                      type="button"
                      variant="outline"
                     
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {editingId === track.id && (
                  <div className="border-t border-brand-100 bg-gradient-to-b from-brand-50/50 to-white px-5 py-5">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100">
                        <Pencil className="h-3.5 w-3.5 text-brand-700" />
                      </span>
                      <span className="text-sm font-bold text-brand-800">Editando: {track.title}</span>
                    </div>
                    <form className="grid gap-5" onSubmit={(e) => handleEditSave(track.id, e)}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <input className="admin-input" defaultValue={track.title} name="title" placeholder="Tema" required />
                        <input className="admin-input" defaultValue={track.artist} name="artist" placeholder="Artista" required />
                      </div>
                      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        <input className="admin-input" defaultValue={track.artworkUrl ?? ''} name="artworkUrl" placeholder="https://..." type="url" />
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-600 transition hover:border-brand-400 hover:bg-brand-50">
                          <FileImage className="h-4 w-4 text-brand-600" />Cambiar caratula
                          <input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" name="artworkFile" type="file" />
                        </label>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-brand-50 hover:border-brand-200">
                        <input defaultChecked={track.isActive} name="isActive" type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500" />
                        Visible en ranking
                      </label>
                      <div className="flex justify-end gap-2">
                        <Button className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100" disabled={saving} onClick={() => setEditingId(null)} type="button" variant="outline">Cancelar</Button>
                        <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-brand-900/20 hover:shadow-lg hover:shadow-brand-900/30 transition-all" disabled={saving} type="submit">
                          <Save className="h-4 w-4" />Guardar
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-100/60">
            <TrendingUp className="h-4 w-4 text-brand-600" />
          </span>
          <h2 className="text-base font-bold text-zinc-900">Agregar cancion</h2>
        </div>
        <form className="grid gap-5 p-4 sm:p-6" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="admin-input" name="title" placeholder="Tema" required />
            <input className="admin-input" name="artist" placeholder="Artista" required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-700">Caratula desde URL</span>
              <input className="admin-input" name="artworkUrl" placeholder="https://..." type="url" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-700">Subir caratula</span>
              <span className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 text-sm font-semibold text-zinc-600 transition hover:border-brand-400 hover:bg-brand-50">
                <FileImage className="h-4 w-4 text-brand-600" />JPG, PNG, WEBP o GIF hasta 5 MB
                <input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" name="artworkFile" type="file" />
              </span>
            </label>
          </div>
          <div className="flex justify-end border-t border-zinc-100 pt-4">
            <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-brand-900/20 hover:shadow-xl hover:shadow-brand-900/30 transition-all" disabled={saving} type="submit">
              <Save className="h-4 w-4" />{saving ? 'Guardando...' : 'Agregar cancion'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


