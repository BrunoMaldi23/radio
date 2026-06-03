'use client';

import { toast } from 'sonner';
import { FormEvent, useState } from 'react';
import { MapPin, Pencil, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { api } from '@/lib/api';

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

export default function AdminFrecuenciaPage() {
  const { token, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const frequencies = [...adminData.frequencies].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeCount = frequencies.filter((freq) => freq.isActive).length;
  const hiddenCount = frequencies.length - activeCount;

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
      await api.createFrequency(token, {
        city: String(form.get('city')), dial: String(form.get('dial')),
        description: String(form.get('description')) || undefined,
        sortOrder: Number(form.get('sortOrder') || 0), isActive: true,
      });
      (e.target as HTMLFormElement).reset();
      toast.success('Frecuencia agregada.');
      await refreshContent();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleEditSave(freqId: number, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await api.updateFrequency(token, freqId, {
        city: String(form.get('city')), dial: String(form.get('dial')),
        description: optionalText(form.get('description')) ?? null,
        sortOrder: Number(form.get('sortOrder') || 0),
        isActive: form.get('isActive') === 'on',
      });
      setEditingId(null);
      toast.success('Frecuencia actualizada.');
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
              <MapPin className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Cobertura radial</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Frecuencias</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Ordena las ciudades, publica u oculta diales y mantiene actualizada la cobertura que ven los oyentes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black">{frequencies.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-zinc-400">Total</p>
            </div>
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-2xl font-black text-emerald-200">{activeCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-emerald-200/70">Activas</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black text-zinc-300">{hiddenCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-zinc-400">Ocultas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
              <MapPin className="h-4 w-4 text-brand-500" />
              Diales registrados
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Se muestran ordenados por el campo Orden.</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
            {frequencies.length} registros
          </span>
        </div>

        {frequencies.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center p-6 text-sm text-zinc-400">
            No hay frecuencias. Agrega la primera abajo.
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
            {frequencies.map((freq) => (
              <div key={freq.id} className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_20px_54px_rgba(15,23,42,0.12)]">
                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto]">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-900/20">
                      <MapPin className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-lg font-black text-zinc-950">{freq.city}</p>
                        <span className={`admin-badge ${freq.isActive ? 'admin-badge-emerald' : 'admin-badge-zinc'}`}>
                          {freq.isActive ? 'Activa' : 'Oculta'}
                        </span>
                      </div>
                      <p className="mt-2 inline-flex rounded-lg bg-brand-50 px-3 py-1 text-base font-black text-brand-700 ring-1 ring-brand-200">{freq.dial}</p>
                      {freq.description && (
                        <p className="mt-3 text-sm leading-6 text-zinc-500">{freq.description}</p>
                      )}
                      <p className="mt-3 text-xs font-semibold text-zinc-400">Orden: {freq.sortOrder}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                    <Button
                      className={`transition-all ${freq.isActive ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      disabled={saving}
                      onClick={() => run(() => api.updateFrequency(token, freq.id, { isActive: !freq.isActive }), freq.isActive ? 'Frecuencia ocultada.' : 'Frecuencia activada.')}
                      type="button"
                      variant="outline"
                     
                    >
                      {freq.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {freq.isActive ? 'Ocultar' : 'Activar'}
                    </Button>
                    <Button
                      className={`transition-all ${editingId === freq.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'}`}
                      disabled={saving}
                      onClick={() => setEditingId(editingId === freq.id ? null : freq.id)}
                      type="button"
                      variant="outline"
                     
                    >
                      <Pencil className="h-3.5 w-3.5" />Editar
                    </Button>
                    <Button
                      className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
                      disabled={saving}
                      onClick={() => { if (window.confirm('Eliminar esta frecuencia?')) run(() => api.deleteFrequency(token, freq.id), 'Frecuencia eliminada.'); }}
                      type="button"
                      variant="outline"
                     
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {editingId === freq.id && (
                  <div className="border-t border-brand-100 bg-gradient-to-b from-brand-50/50 to-white px-5 py-5">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100">
                        <Pencil className="h-3.5 w-3.5 text-brand-700" />
                      </span>
                      <span className="text-sm font-bold text-brand-800">Editando: {freq.city}</span>
                    </div>
                    <form className="grid gap-5" onSubmit={(e) => handleEditSave(freq.id, e)}>
                      <div className="grid gap-4 md:grid-cols-3">
                        <input className="admin-input" defaultValue={freq.city} name="city" placeholder="Ciudad o zona" required />
                        <input className="admin-input" defaultValue={freq.dial} name="dial" placeholder="107.5 FM / Online" required />
                        <input className="admin-input" defaultValue={freq.sortOrder} name="sortOrder" placeholder="Orden" type="number" />
                      </div>
                      <textarea className="admin-input min-h-20 resize-y leading-relaxed" defaultValue={freq.description ?? ''} name="description" placeholder="Descripcion opcional" />
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-brand-50 hover:border-brand-200">
                        <input defaultChecked={freq.isActive} name="isActive" type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500" />
                        Frecuencia activa
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 bg-gradient-to-r from-brand-50/80 to-white px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-900/20">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-zinc-950">Nueva frecuencia</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Agrega una ciudad o senal online al listado publico.</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
            Nuevo registro
          </span>
        </div>
        <form className="grid gap-5 p-4 sm:p-6" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-xs font-bold text-zinc-600">Ciudad o zona</span>
              <input className="admin-input" name="city" placeholder="Labranza" required />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold text-zinc-600">Dial</span>
              <input className="admin-input" name="dial" placeholder="107.5 FM / Online" required />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-bold text-zinc-600">Orden</span>
              <input className="admin-input" name="sortOrder" placeholder="0" type="number" />
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-xs font-bold text-zinc-600">Descripcion opcional</span>
            <textarea className="admin-input min-h-24 resize-y leading-relaxed" name="description" placeholder="Ej: Cobertura para Labranza y alrededores" />
          </label>
          <div className="flex justify-end border-t border-zinc-100 pt-4">
            <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-brand-900/20 hover:shadow-xl hover:shadow-brand-900/30 transition-all" disabled={saving} type="submit">
              <Save className="h-4 w-4" />{saving ? 'Guardando...' : 'Guardar frecuencia'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


