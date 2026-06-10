'use client';

import { toast } from 'sonner';
import { FormEvent, useMemo, useState, type ComponentType } from 'react';
import {
  CheckCircle2,
  CircleSlash,
  KeyRound,
  Pencil,
  Save,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { api, type User } from '@/lib/api';

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length > 0 ? text : undefined;
}

type RoleFilter = 'ALL' | User['role'];
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const roleConfig: Record<string, { label: string; badge: string; icon: ComponentType<{ className?: string }>; hint: string }> = {
  ADMIN:    { label: 'Administrador', badge: 'admin-badge-amber', icon: ShieldAlert, hint: 'Acceso completo' },
  EDITOR:   { label: 'Editor', badge: 'admin-badge-violet', icon: Shield, hint: 'Contenido y comunidad' },
  OPERATOR: { label: 'Operador', badge: 'admin-badge-zinc', icon: ShieldCheck, hint: 'Transmision' },
};

export default function AdminUsuariosPage() {
  const { token, user: currentUser, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const activeCount = adminData.users.filter((acct) => acct.isActive).length;
  const inactiveCount = adminData.users.length - activeCount;
  const adminCount = adminData.users.filter((acct) => acct.role === 'ADMIN').length;
  const operatorCount = adminData.users.filter((acct) => acct.role === 'OPERATOR').length;
  const editorCount = adminData.users.filter((acct) => acct.role === 'EDITOR').length;
  const filteredUsers = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return adminData.users
      .filter((acct) => roleFilter === 'ALL' || acct.role === roleFilter)
      .filter((acct) => {
        if (statusFilter === 'ACTIVE') return acct.isActive;
        if (statusFilter === 'INACTIVE') return !acct.isActive;
        return true;
      })
      .filter((acct) => {
        if (!cleanQuery) return true;
        return `${acct.name} ${acct.email} ${acct.role}`.toLowerCase().includes(cleanQuery);
      })
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name));
  }, [adminData.users, query, roleFilter, statusFilter]);

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
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <p>Accesos internos</p>
          <h1>Usuarios</h1>
        </div>
        <div className="admin-users-summary">
          <span><strong>{activeCount}</strong> Activos</span>
          <span><strong>{inactiveCount}</strong> Inactivos</span>
          <span><strong>{adminCount}</strong> Admins</span>
          <span><strong>{editorCount + operatorCount}</strong> Equipo</span>
        </div>
      </div>

      <section className="admin-shell-frame admin-users-workspace">
        <div className="admin-users-create">
          <div className="admin-users-create-head">
            <span>
              <UserPlus className="h-4 w-4" />
            </span>
            <div>
              <h2>Nuevo usuario</h2>
              <p>Alta rapida con rol inicial.</p>
            </div>
          </div>
          <form className="admin-users-create-form" onSubmit={handleCreate}>
            <input className="admin-input" name="name" placeholder="Nombre" required />
            <input className="admin-input" name="email" placeholder="Correo electronico" required type="email" />
            <input className="admin-input" minLength={8} name="password" placeholder="Contrasena temporal" required type="password" />
            <select className="admin-input bg-white" defaultValue="EDITOR" name="role">
              <option value="EDITOR">Editor / Periodista</option>
              <option value="OPERATOR">Operador de transmision</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <Button className="admin-action-save h-11 transition-all" disabled={saving} type="submit">
              <UserPlus className="h-4 w-4" />{saving ? 'Creando...' : 'Crear'}
            </Button>
          </form>
        </div>

        <div className="admin-users-directory">
          <div className="admin-users-directory-head">
            <div>
              <h2>
                <UserCog className="h-4 w-4 text-amber-700" />
                Directorio de accesos
              </h2>
              <p>{filteredUsers.length}/{adminData.users.length} usuarios visibles</p>
            </div>
          </div>
          <div className="admin-users-toolbar">
            <label className="admin-users-search">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo o rol" />
            </label>
            <div className="admin-users-segment" aria-label="Filtrar por rol">
              {(['ALL', 'ADMIN', 'EDITOR', 'OPERATOR'] as RoleFilter[]).map((role) => (
                <button className={roleFilter === role ? 'is-active' : ''} key={role} onClick={() => setRoleFilter(role)} type="button">
                  {role === 'ALL' ? 'Todos' : roleConfig[role].label}
                </button>
              ))}
            </div>
            <div className="admin-users-segment" aria-label="Filtrar por estado">
              {([
                ['ALL', 'Todos'],
                ['ACTIVE', 'Activos'],
                ['INACTIVE', 'Inactivos'],
              ] as Array<[StatusFilter, string]>).map(([status, label]) => (
                <button className={statusFilter === status ? 'is-active' : ''} key={status} onClick={() => setStatusFilter(status)} type="button">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center p-6 text-center text-sm font-bold text-zinc-400">
              No hay usuarios que coincidan con los filtros.
            </div>
          ) : (
            <div className="admin-users-list">
              {filteredUsers.map((acct) => {
                const rc = roleConfig[acct.role] ?? roleConfig.EDITOR;
                const RcIcon = rc.icon;
                return (
                  <article key={acct.id} className={`admin-user-row ${editingId === acct.id ? 'is-editing' : ''}`}>
                    <div className="admin-user-main">
                      <span className="admin-user-avatar">{acct.name.charAt(0).toUpperCase()}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3>{acct.name}</h3>
                          <span className={`admin-badge ${rc.badge}`}>
                            <RcIcon className="mr-1 inline h-3 w-3" />
                            {rc.label}
                          </span>
                          <span className={`admin-badge ${acct.isActive ? 'admin-badge-emerald' : 'admin-badge-rose'}`}>
                            {acct.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <p>{acct.email}</p>
                      </div>
                    </div>

                    <div className="admin-user-role-note">
                      <KeyRound className="h-4 w-4" />
                      <span>{rc.hint}</span>
                    </div>

                    <div className="admin-user-actions">
                      <Button
                        aria-label={acct.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        className={`transition-all ${acct.isActive ? 'admin-action-disable' : 'admin-action-activate'}`}
                        disabled={saving}
                        onClick={() => run(() => api.updateUser(token, acct.id, { isActive: !acct.isActive }), acct.isActive ? 'Usuario desactivado.' : 'Usuario activado.')}
                        title={acct.isActive ? 'Desactivar' : 'Activar'}
                        type="button"
                        variant="outline"
                      >
                        {acct.isActive ? <CircleSlash className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        <span>{acct.isActive ? 'Desactivar' : 'Activar'}</span>
                      </Button>
                      <Button
                        aria-label="Editar usuario"
                        className={`transition-all ${editingId === acct.id ? 'admin-action-edit-active' : 'admin-action-edit'}`}
                        disabled={saving}
                        onClick={() => setEditingId(editingId === acct.id ? null : acct.id)}
                        title="Editar"
                        type="button"
                        variant="outline"
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                    </div>

                    {editingId === acct.id && (
                      <form className="admin-user-edit" onSubmit={(e) => handleEditSave(acct.id, e)}>
                        <input className="admin-input" defaultValue={acct.name} name="name" placeholder="Nombre" required />
                        <input className="admin-input" defaultValue={acct.email} name="email" placeholder="Correo" required type="email" />
                        <input className="admin-input" minLength={8} name="password" placeholder="Nueva contrasena (dejar vacio para mantener)" type="password" />
                        <select className="admin-input bg-white" defaultValue={acct.role} name="role">
                          <option value="EDITOR">Editor / Periodista</option>
                          <option value="OPERATOR">Operador</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                        <label className="admin-user-toggle">
                          <input defaultChecked={acct.isActive} name="isActive" type="checkbox" />
                          <span>Usuario activo</span>
                        </label>
                        <div className="admin-user-edit-actions">
                          <Button className="admin-action-cancel transition-all" disabled={saving} onClick={() => setEditingId(null)} type="button" variant="outline">Cancelar</Button>
                          <Button className="admin-action-save transition-all" disabled={saving} type="submit">
                            <Save className="h-4 w-4" />Guardar
                          </Button>
                        </div>
                      </form>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


