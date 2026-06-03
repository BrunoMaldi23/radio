'use client';

import { toast } from 'sonner';
import { FormEvent, useState } from 'react';
import { Pencil, Save, UserPlus, Users, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { api, type User } from '@/lib/api';

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

const roleConfig: Record<string, { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  ADMIN:    { label: 'Administrador',  badge: 'admin-badge-amber',  icon: ShieldAlert },
  EDITOR:   { label: 'Editor',         badge: 'admin-badge-violet', icon: Shield },
  OPERATOR: { label: 'Operador',       badge: 'admin-badge-zinc',   icon: ShieldCheck },
};

export default function AdminUsuariosPage() {
  const { token, user: currentUser, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const activeCount = adminData.users.filter((acct) => acct.isActive).length;
  const inactiveCount = adminData.users.length - activeCount;
  const adminCount = adminData.users.filter((acct) => acct.role === 'ADMIN').length;

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-200/60 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-warm sm:p-6">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        Solo los administradores pueden gestionar usuarios.
      </div>
    );
  }

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
      await api.createUser(token, {
        name: String(form.get('name')), email: String(form.get('email')),
        password: String(form.get('password')),
        role: String(form.get('role')) as User['role'],
        isActive: true, isPenalized: false,
      });
      (e.target as HTMLFormElement).reset();
      toast.success('Usuario creado exitosamente.');
      await refreshContent();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  }

  async function handleEditSave(acctId: number, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = optionalText(form.get('password'));
    setSaving(true);
    try {
      await api.updateUser(token, acctId, {
        name: String(form.get('name')), email: String(form.get('email')),
        ...(password ? { password } : {}),
        role: String(form.get('role')) as User['role'],
        isActive: form.get('isActive') === 'on',
      });
      setEditingId(null);
      toast.success('Usuario actualizado.');
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
              <Users className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Accesos internos</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Usuarios</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Administra roles, cuentas activas y permisos de acceso al panel de administracion.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-2xl font-black text-emerald-200">{activeCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-emerald-200/70">Activos</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black text-zinc-300">{inactiveCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-zinc-400">Inactivos</p>
            </div>
            <div className="rounded-lg border border-brand-300/20 bg-brand-500/10 px-4 py-3">
              <p className="text-2xl font-black text-brand-200">{adminCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-brand-200/70">Admins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-zinc-900">
              <Users className="h-4 w-4 text-brand-500" />
              Usuarios registrados
            </h2>
            <p className="mt-1 text-xs text-zinc-500">Revisa estado, rol y acceso de cada cuenta.</p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
            {adminData.users.length} registros
          </span>
        </div>

        {adminData.users.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center p-6 text-sm text-zinc-400">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
            {adminData.users.map((acct) => {
              const rc = roleConfig[acct.role] ?? roleConfig.EDITOR;
              const RcIcon = rc.icon;
              return (
                <div key={acct.id} className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_20px_54px_rgba(15,23,42,0.12)]">
                  <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto]">
                    <div className="flex items-start gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-black text-white shadow-md shadow-brand-900/20">
                        {acct.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="text-lg font-black text-zinc-950">{acct.name}</p>
                          <span className={`admin-badge ${rc.badge}`}>
                            <RcIcon className="mr-1 inline h-3 w-3" />
                            {rc.label}
                          </span>
                          <span className={`admin-badge ${acct.isActive ? 'admin-badge-emerald' : 'admin-badge-rose'}`}>
                            {acct.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-zinc-500">{acct.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                      <Button
                        className={`transition-all ${acct.isActive ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        disabled={saving}
                        onClick={() => run(() => api.updateUser(token, acct.id, { isActive: !acct.isActive }), acct.isActive ? 'Usuario desactivado.' : 'Usuario activado.')}
                        type="button"
                        variant="outline"
                       
                      >
                        {acct.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        className={`transition-all ${editingId === acct.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'}`}
                        disabled={saving}
                        onClick={() => setEditingId(editingId === acct.id ? null : acct.id)}
                        type="button"
                        variant="outline"
                       
                      >
                        <Pencil className="h-3.5 w-3.5" />Editar
                      </Button>
                    </div>
                  </div>

                  {editingId === acct.id && (
                    <div className="border-t border-brand-100 bg-gradient-to-b from-brand-50/50 to-white px-5 py-5">
                      <div className="mb-5 flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100">
                          <Pencil className="h-3.5 w-3.5 text-brand-700" />
                        </span>
                        <span className="text-sm font-bold text-brand-800">Editando: {acct.name}</span>
                      </div>
                      <form className="grid gap-5" onSubmit={(e) => handleEditSave(acct.id, e)}>
                        <div className="grid gap-4 md:grid-cols-2">
                          <input className="admin-input" defaultValue={acct.name} name="name" placeholder="Nombre" required />
                          <input className="admin-input" defaultValue={acct.email} name="email" placeholder="Correo" required type="email" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <input className="admin-input" minLength={8} name="password" placeholder="Nueva contrasena (dejar vacio para mantener)" type="password" />
                          <select className="admin-input bg-white" defaultValue={acct.role} name="role">
                            <option value="EDITOR">Editor / Periodista</option>
                            <option value="OPERATOR">Operador</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-brand-50 hover:border-brand-200">
                          <input defaultChecked={acct.isActive} name="isActive" type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500" />
                          Usuario activo
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
              );
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-50 to-brand-100/60">
            <UserPlus className="h-4 w-4 text-brand-600" />
          </span>
          <h2 className="text-base font-bold text-zinc-900">Nuevo usuario</h2>
        </div>
        <form className="grid gap-5 p-4 sm:p-6" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="admin-input" name="name" placeholder="Nombre" required />
            <input className="admin-input" name="email" placeholder="Correo electronico" required type="email" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="admin-input" minLength={8} name="password" placeholder="Contrasena temporal (min 8 caracteres)" required type="password" />
            <select className="admin-input bg-white" defaultValue="EDITOR" name="role">
              <option value="EDITOR">Editor / Periodista</option>
              <option value="OPERATOR">Operador de transmision</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <p className="rounded-lg border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm leading-6 text-zinc-500">
            El rol <strong>Editor</strong> puede gestionar contenido, pero no usuarios.
            El <strong>Operador</strong> solo accede a transmision.
            El <strong>Administrador</strong> tiene acceso completo.
          </p>
          <div className="flex justify-end border-t border-zinc-100 pt-4">
            <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-brand-900/20 hover:shadow-xl hover:shadow-brand-900/30 transition-all" disabled={saving} type="submit">
              <UserPlus className="h-4 w-4" />{saving ? 'Creando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


