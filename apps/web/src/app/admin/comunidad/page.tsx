'use client';

import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Archive,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  Heart,
  ImageIcon,
  Images,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/image-upload';
import { useAdminAuth } from '@/lib/admin-auth';
import { api, type Article } from '@/lib/api';

type CommunitySection = 'Eventos' | 'Galeria';

const sections: Array<{
  id: CommunitySection;
  label: string;
  singular: string;
  title: string;
  action: string;
  icon: typeof CalendarDays;
}> = [
  {
    id: 'Eventos',
    label: 'Eventos',
    singular: 'evento',
    title: 'Agenda publica',
    action: 'Publicar evento',
    icon: CalendarDays,
  },
  {
    id: 'Galeria',
    label: 'Galeria',
    singular: 'imagen',
    title: 'Galeria en movimiento',
    action: 'Subir imagen',
    icon: Images,
  },
];

const statusConfig: Record<Article['status'], { label: string; badge: string }> = {
  DRAFT: { label: 'Borrador', badge: 'admin-badge-zinc' },
  SCHEDULED: { label: 'Programado', badge: 'admin-badge-violet' },
  PUBLISHED: { label: 'Publicado', badge: 'admin-badge-emerald' },
  ARCHIVED: { label: 'Archivado', badge: 'admin-badge-rose' },
};

type CommunityForm = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl?: string | null;
};

function emptyForm(): CommunityForm {
  return { title: '', slug: '', excerpt: '', body: '', coverUrl: undefined };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function dateLabel(value: string | null | undefined) {
  if (!value) return 'Sin publicar';
  return new Date(value).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function imageOf(item: Article | null | undefined) {
  return item?.coverUrl ?? null;
}

function byFreshness(items: Article[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export default function AdminComunidadPage() {
  const { token, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [section, setSection] = useState<CommunitySection>('Eventos');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState(emptyForm());
  const [editStatus, setEditStatus] = useState<Article['status']>('PUBLISHED');

  const communityItems = useMemo(
    () => adminData.articles.filter((article) => article.category === 'Eventos' || article.category === 'Galeria'),
    [adminData.articles]
  );
  const activeSection = sections.find((item) => item.id === section) ?? sections[0];
  const ActiveIcon = activeSection.icon;
  const items = byFreshness(communityItems.filter((article) => article.category === section));
  const events = communityItems.filter((article) => article.category === 'Eventos');
  const gallery = communityItems.filter((article) => article.category === 'Galeria');
  const spotlight = items.find((item) => item.status === 'PUBLISHED') ?? items[0];
  const totalAttendees = events.reduce((total, item) => total + (item.attendees ?? 0), 0);
  const totalLikes = gallery.reduce((total, item) => total + (item.likes ?? 0), 0);

  function setFormValue(key: keyof CommunityForm, value: string | null | undefined) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setEditValue(key: keyof CommunityForm, value: string | null | undefined) {
    setEditForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(article: Article) {
    setEditingId(article.id);
    setEditForm({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      body: article.body,
      coverUrl: article.coverUrl ?? undefined,
    });
    setEditStatus(article.status);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.createArticle(token, {
        title: form.title,
        slug: slugify(form.slug || form.title),
        excerpt: form.excerpt,
        body: form.body || form.excerpt,
        category: section,
        coverUrl: form.coverUrl ?? undefined,
        status: 'PUBLISHED',
      });
      toast.success(section === 'Eventos' ? 'Evento publicado.' : 'Imagen publicada en galeria.');
      setForm(emptyForm());
      await refreshContent();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo publicar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(article: Article) {
    setSaving(true);
    try {
      await api.updateArticle(token, article.id, {
        title: editForm.title,
        slug: slugify(editForm.slug || editForm.title),
        excerpt: editForm.excerpt,
        body: editForm.body || editForm.excerpt,
        coverUrl: editForm.coverUrl === undefined ? article.coverUrl ?? undefined : editForm.coverUrl ?? undefined,
        status: editStatus,
      });
      setEditingId(null);
      toast.success('Registro actualizado.');
      await refreshContent();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setSaving(true);
    try {
      await action();
      toast.success(success);
      await refreshContent();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo completar la accion.');
    } finally {
      setSaving(false);
    }
  }

  async function removeArticle(article: Article) {
    if (!window.confirm('Eliminar este registro de comunidad?')) return;
    await runAction(() => api.deleteArticle(token, article.id), 'Registro eliminado.');
  }

  return (
    <div className="grid gap-6">
      <section className="community-admin-hero">
        <div className="community-admin-hero-copy">
          <span>
            <Sparkles className="h-4 w-4" />
            Comunidad admin
          </span>
          <h1>Agenda y galeria con pulso propio.</h1>
          <p>Publica eventos, sube imagenes al momento y monitorea la reaccion del publico desde una cabina mas visual.</p>
        </div>
        <div className="community-admin-stats">
          <div>
            <CalendarCheck2 className="h-5 w-5" />
            <strong>{events.length}</strong>
            <span>eventos</span>
          </div>
          <div>
            <ImageIcon className="h-5 w-5" />
            <strong>{gallery.length}</strong>
            <span>imagenes</span>
          </div>
          <div>
            <UsersRound className="h-5 w-5" />
            <strong>{totalAttendees}</strong>
            <span>asistire</span>
          </div>
          <div>
            <Heart className="h-5 w-5" />
            <strong>{totalLikes}</strong>
            <span>likes</span>
          </div>
        </div>
      </section>

      <div className="community-admin-tabs">
        {sections.map((item) => {
          const Icon = item.icon;
          const active = item.id === section;
          return (
            <button
              className={active ? 'is-active' : ''}
              key={item.id}
              onClick={() => {
                setSection(item.id);
                setEditingId(null);
              }}
              type="button"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="community-create-card">
        <div className="community-create-head">
          <span className="community-create-badge">
            {section === 'Eventos' ? <CalendarDays className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            {activeSection.action}
          </span>
          <span className="community-create-head-hint">
            <Sparkles className="h-3 w-3" />
            Publicacion inmediata
          </span>
        </div>
        <form className="community-create-body" onSubmit={handleCreate}>
          <div className="community-create-fields">
            <div className="community-create-field">
              <label className="community-create-label">
                <span className="community-create-label-text">
                  <Pencil className="h-3 w-3" />
                  Titulo
                </span>
                <input className="admin-input community-create-input" required value={form.title} onChange={(event) => setFormValue('title', event.target.value)} placeholder={section === 'Eventos' ? 'Ej: Tarde familiar en Labranza' : 'Ej: Cabina abierta con vecinos'} />
              </label>
            </div>
            <div className="community-create-field">
              <label className="community-create-label">
                <span className="community-create-label-text">
                  <span className="font-mono text-[0.6rem]">/</span>
                  Slug
                </span>
                <input className="admin-input community-create-input" value={form.slug} onChange={(event) => setFormValue('slug', event.target.value)} placeholder={slugify(form.title) || 'slug-opcional'} />
              </label>
            </div>
            <div className="community-create-field">
              <label className="community-create-label">
                <span className="community-create-label-text">
                  <span className="font-bold text-xs">&#x2192;</span>
                  Descripcion
                </span>
                <textarea className="admin-input community-create-textarea" required value={form.excerpt} onChange={(event) => setFormValue('excerpt', event.target.value)} placeholder="Texto breve que vera el publico." />
              </label>
            </div>
          </div>
          <div className="community-create-media">
            <span className="community-create-label-text">{section === 'Eventos' ? 'Imagen del evento' : 'Imagen para galeria'}</span>
            <ImageUpload token={token} value={form.coverUrl} onChange={(value) => setFormValue('coverUrl', value)} label={section === 'Eventos' ? 'Subir imagen del evento' : 'Subir imagen para galeria'} />
            <label className="community-create-label">
              <span className="community-create-label-text">{section === 'Eventos' ? 'Detalle del evento' : 'Credito o historia'}</span>
              <textarea className="admin-input community-create-textarea-sm" value={form.body} onChange={(event) => setFormValue('body', event.target.value)} placeholder={section === 'Eventos' ? 'Informacion adicional para el detalle publico.' : 'Quien tomo la foto o contexto de la imagen.'} />
            </label>
          </div>
          <div className="community-create-footer">
            <div className="flex gap-2">
              <button className="community-create-clear" onClick={() => setForm(emptyForm())} type="button">Limpiar</button>
              <button className="community-create-submit" disabled={saving} type="submit">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Publicando...' : activeSection.action}
              </button>
            </div>
          </div>
        </form>
      </div>

      <section className="community-admin-board">
        <div className="community-admin-main">
          <article className={`community-admin-spotlight${imageOf(spotlight) ? ' has-image' : ''}`}>
            {imageOf(spotlight) && <img src={imageOf(spotlight)!} alt="" />}
            <div className="community-admin-spotlight-shade" />
            <div className="community-admin-spotlight-body">
              <span className="community-admin-spotlight-badge">
                <Eye className="h-4 w-4" />
                Vista publica
              </span>
              <h2>{spotlight?.title ?? `Sin ${activeSection.singular} publicado`}</h2>
              <p>{spotlight?.excerpt ?? `Carga un ${activeSection.singular} para activar esta parte de comunidad.`}</p>
            </div>
          </article>

          <div className="community-admin-list-head">
            <div>
              <p>{activeSection.title}</p>
              <h2>{activeSection.label}</h2>
            </div>
            <span>{items.length} registros</span>
          </div>

          <div className="community-admin-list">
            {items.length === 0 ? (
              <div className="community-admin-empty">No hay registros todavia. Crea uno usando el formulario de arriba.</div>
            ) : (
              items.map((item) => {
                const status = statusConfig[item.status] ?? statusConfig.DRAFT;
                const hasImage = imageOf(item);
                return (
                  <article className="community-admin-card" key={item.id}>
                    <div className="community-admin-card-image">
                      {hasImage ? <img src={hasImage} alt="" /> : (
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="flex flex-col items-center gap-2 text-slate-300">
                            {section === 'Eventos' ? <CalendarDays className="h-8 w-8" /> : <Images className="h-8 w-8" />}
                            <span className="text-xs font-bold uppercase tracking-wider">Sin imagen</span>
                          </div>
                        </div>
                      )}
                      <div />
                      <span className={`admin-badge ${status.badge} community-admin-card-badge`}>{status.label}</span>
                    </div>
                    <div className="community-admin-card-body">
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                      <div className="community-admin-card-meta">
                        <span>/{item.slug}</span>
                        <span>{dateLabel(item.publishedAt ?? item.updatedAt)}</span>
                        <span>{section === 'Eventos' ? `${item.attendees ?? 0} asistentes` : `${item.likes ?? 0} likes`}</span>
                      </div>
                    </div>
                    <div className="community-admin-card-actions">
                      {item.status === 'DRAFT' && (
                        <Button aria-label="Publicar" className="admin-action-publish" disabled={saving} onClick={() => runAction(() => api.updateArticle(token, item.id, { status: 'PUBLISHED' }), 'Publicado.')} type="button" variant="outline">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status === 'PUBLISHED' && (
                        <Button aria-label="Archivar" className="admin-action-archive" disabled={saving} onClick={() => runAction(() => api.updateArticle(token, item.id, { status: 'ARCHIVED' }), 'Archivado.')} type="button" variant="outline">
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status === 'ARCHIVED' && (
                        <Button aria-label="Restaurar" className="admin-action-restore" disabled={saving} onClick={() => runAction(() => api.updateArticle(token, item.id, { status: 'DRAFT' }), 'Restaurado.')} type="button" variant="outline">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button aria-label="Editar" className={editingId === item.id ? 'admin-action-edit-active' : 'admin-action-edit'} disabled={saving} onClick={() => (editingId === item.id ? setEditingId(null) : startEdit(item))} type="button" variant="outline">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button aria-label="Eliminar" className="admin-action-delete" disabled={saving} onClick={() => removeArticle(item)} type="button" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {editingId === item.id && (
                      <form className="community-admin-edit" onSubmit={(event) => { event.preventDefault(); void handleEditSave(item); }}>
                        <input className="admin-input" placeholder="Titulo" required value={editForm.title} onChange={(event) => setEditValue('title', event.target.value)} />
                        <input className="admin-input" placeholder="Slug" value={editForm.slug} onChange={(event) => setEditValue('slug', event.target.value)} />
                        <textarea className="admin-input min-h-20 resize-y md:col-span-2" placeholder="Resumen publico" required value={editForm.excerpt} onChange={(event) => setEditValue('excerpt', event.target.value)} />
                        <textarea className="admin-input min-h-24 resize-y md:col-span-2" placeholder="Detalle o creditos" value={editForm.body} onChange={(event) => setEditValue('body', event.target.value)} />
                        <div className="md:col-span-2">
                          <ImageUpload token={token} value={editForm.coverUrl} onChange={(value) => setEditValue('coverUrl', value ?? null)} label="Imagen" />
                        </div>
                        <select className="admin-input bg-white" value={editStatus} onChange={(event) => setEditStatus(event.target.value as Article['status'])}>
                          <option value="PUBLISHED">Publicado</option>
                          <option value="DRAFT">Borrador</option>
                          <option value="ARCHIVED">Archivado</option>
                        </select>
                        <div className="flex justify-end gap-2">
                          <Button className="admin-action-cancel" disabled={saving} onClick={() => setEditingId(null)} type="button" variant="outline">Cancelar</Button>
                          <Button className="admin-action-save" disabled={saving} type="submit">
                            <Save className="h-4 w-4" />
                            Guardar
                          </Button>
                        </div>
                      </form>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
