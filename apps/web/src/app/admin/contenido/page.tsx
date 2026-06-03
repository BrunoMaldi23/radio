'use client';

import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Archive,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  FileText,
  Gauge,
  ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Tags,
  Trash2,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { api, type Article } from '@/lib/api';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUpload } from '@/components/admin/image-upload';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const categories = [
  { id: 'Noticias' as const, label: 'Noticias', color: 'bg-brand-50 text-brand-800 border-brand-300' },
  { id: 'Lo nuevo' as const, label: 'Lo nuevo', color: 'bg-violet-50 text-violet-800 border-violet-300' },
  { id: 'Mejores momentos' as const, label: 'Mejores momentos', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  { id: 'Concursos' as const, label: 'Concursos', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
];

type CategoryId = (typeof categories)[number]['id'];

const statusConfig: Record<string, { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:    { label: 'Borrador',  badge: 'admin-badge-zinc',    icon: Eye },
  PUBLISHED: { label: 'Publicado', badge: 'admin-badge-emerald', icon: CheckCircle2 },
  ARCHIVED:  { label: 'Archivado', badge: 'admin-badge-rose',    icon: Archive },
};

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(value: string) {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).length : 0;
}

function readingMinutes(value: string) {
  return Math.max(1, Math.ceil(countWords(value) / 180));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getEditorialChecks(article: { title: string; excerpt: string; body: string; coverUrl?: string | null; slug?: string }) {
  const bodyWords = countWords(article.body);
  return [
    { label: 'Titulo claro', ok: article.title.trim().length >= 12, detail: 'Ideal sobre 12 caracteres' },
    { label: 'Slug listo', ok: Boolean(article.slug?.trim() || article.title.trim()), detail: 'URL limpia para publicar' },
    { label: 'Resumen util', ok: article.excerpt.trim().length >= 50, detail: 'Minimo sugerido 50 caracteres' },
    { label: 'Cuerpo suficiente', ok: bodyWords >= 80, detail: `${bodyWords} palabras` },
    { label: 'Portada asignada', ok: Boolean(article.coverUrl), detail: 'Mejora lectura y portada web' },
  ];
}

function getEditorialScore(article: { title: string; excerpt: string; body: string; coverUrl?: string | null; slug?: string }) {
  const checks = getEditorialChecks(article);
  return Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
}

function FieldHint({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-xs font-bold text-slate-600">
      <Icon className="h-3.5 w-3.5 text-amber-600" />
      {label}: <span className="min-w-0 truncate text-slate-950">{value}</span>
    </span>
  );
}

function EditorialChecklist({ article }: { article: { title: string; excerpt: string; body: string; coverUrl?: string | null; slug?: string } }) {
  const checks = getEditorialChecks(article);
  const score = getEditorialScore(article);

  return (
    <aside className="rounded-lg border border-slate-900/10 bg-white/75 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Calidad editorial</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">{score}% listo</h3>
        </div>
        <span className={`grid h-12 w-12 place-items-center rounded-lg text-sm font-black ${
          score >= 80 ? 'bg-emerald-100 text-emerald-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
        }`}>
          <Gauge className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {checks.map((item) => (
          <div className="flex items-start gap-2 rounded-md bg-white/70 p-2" key={item.label}>
            {item.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />}
            <span>
              <span className="block text-sm font-bold text-slate-800">{item.label}</span>
              <span className="block text-xs text-slate-500">{item.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function ArticlePreview({ article }: { article: Partial<Article> & { title: string; excerpt: string; body: string } }) {
  const focal = article.coverFocal ? article.coverFocal : undefined;
  const title = article.title || 'Sin titulo';
  const excerpt = article.excerpt || 'Sin resumen';
  return (
    <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/90 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
      {article.coverUrl && (
        <div className="relative h-64 w-full overflow-hidden bg-slate-950">
          <img src={article.coverUrl} alt="" className="h-full w-full" style={{ objectFit: 'cover', objectPosition: focal ?? '50% 50%' }} />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />
        </div>
      )}
      <div className="p-4 sm:p-6">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-amber-200 shadow-sm">
          <Eye className="h-3 w-3" />
          Vista noticia
        </span>
        <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{title}</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">{excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <FieldHint icon={Type} label="Palabras" value={String(countWords(article.body))} />
          <FieldHint icon={CalendarClock} label="Lectura" value={`${readingMinutes(article.body)} min`} />
        </div>
        <div
          className="prose prose-sm mt-6 max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: article.body || '<p class="text-zinc-300 italic">Sin contenido</p>' }}
        />
      </div>
    </div>
  );
}

export default function AdminContentPage() {
  const { token, adminData, saving, setSaving, refreshContent } = useAdminAuth();
  const [category, setCategory] = useState<CategoryId>('Noticias');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Article['status']>('ALL');
  const [showPreview, setShowPreview] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCover, setFormCover] = useState<string | undefined>();
  const [formFocal, setFormFocal] = useState<string | undefined>();
  const [formPublish, setFormPublish] = useState(false);

  const [editCover, setEditCover] = useState<string | undefined>();
  const [editFocal, setEditFocal] = useState<string | undefined>();
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editStatus, setEditStatus] = useState<string>('DRAFT');
  const publishedCount = adminData.articles.filter((article) => article.status === 'PUBLISHED').length;
  const draftCount = adminData.articles.filter((article) => article.status === 'DRAFT').length;
  const archivedCount = adminData.articles.filter((article) => article.status === 'ARCHIVED').length;
  const currentDraftScore = getEditorialScore({
    title: formTitle,
    slug: slugify(formSlug || formTitle),
    excerpt: formExcerpt,
    body: formBody,
    coverUrl: formCover,
  });
  const currentWords = countWords(formBody);
  const currentSlug = slugify(formSlug || formTitle);

  const filteredArticles = useMemo(() => {
    const byCategory = adminData.articles.filter((a) => a.category === category && (statusFilter === 'ALL' || a.status === statusFilter));
    if (!search) return byCategory;
    const q = search.toLowerCase();
    return byCategory.filter(
      (a) => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    );
  }, [adminData.articles, category, search, statusFilter]);

  function resetForm() {
    setFormTitle(''); setFormSlug(''); setFormExcerpt('');
    setFormBody(''); setFormCover(undefined); setFormFocal(undefined); setFormPublish(false); setShowPreview(false);
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createArticle(token, {
        title: formTitle, slug: slugify(formSlug || formTitle),
        excerpt: formExcerpt, body: formBody, category,
        coverUrl: formCover, status: formPublish ? 'PUBLISHED' : 'DRAFT',
      });
      toast.success('Contenido guardado en ' + category);
      resetForm();
      await refreshContent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally { setSaving(false); }
  }

  function startEdit(article: Article) {
    setEditingId(article.id);
    setEditTitle(article.title); setEditSlug(article.slug);
    setEditExcerpt(article.excerpt); setEditBody(article.body);
    setEditCover(article.coverUrl ?? undefined); setEditFocal(article.coverFocal ?? undefined); setEditStatus(article.status);
  }

  async function handleEditSave(article: Article) {
    setSaving(true);
    try {
      await api.updateArticle(token, article.id, {
        title: editTitle, slug: slugify(editSlug || editTitle),
        excerpt: editExcerpt, body: editBody,
        coverUrl: editCover ?? article.coverUrl,
        status: editStatus as Article['status'],
      });
      setEditingId(null);
      toast.success('Articulo actualizado');
      await refreshContent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al editar');
    } finally { setSaving(false); }
  }

  async function runAction(action: () => Promise<unknown>, okMsg: string) {
    setSaving(true);
    try { await action(); toast.success(okMsg); await refreshContent(); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="grid gap-6">
      <div className="ink-panel relative overflow-hidden rounded-xl p-4 text-white sm:p-6">
        <div className="absolute inset-0 signal-grid opacity-[0.12]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="relative grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-amber-400 text-slate-950 shadow-lg shadow-black/20">
              <FileText className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">CMS de la radio</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Mesa editorial</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Redacta noticias con portada, resumen, cuerpo, estado editorial, vista previa y control de calidad antes de publicar.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center lg:grid-cols-4">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <p className="text-2xl font-black text-emerald-200">{publishedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-emerald-200/70">Publicados</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-2xl font-black text-zinc-300">{draftCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-zinc-400">Borradores</p>
            </div>
            <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3">
              <p className="text-2xl font-black text-rose-200">{archivedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-rose-200/70">Archivados</p>
            </div>
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3">
              <p className="text-2xl font-black text-amber-200">{currentDraftScore}%</p>
              <p className="text-[10px] font-bold uppercase tracking-normal text-amber-200/70">Borrador</p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-slate-900/10 bg-white/75 p-4 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Biblioteca editorial</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Contenido publicado y borradores</h2>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="admin-input pl-9"
              placeholder="Buscar por titulo, slug o resumen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setEditingId(null); setSearch(''); }}
              className={`rounded-lg border px-4 py-2 text-sm font-black transition-all duration-200 ${
                category === cat.id
                  ? 'border-amber-300 bg-slate-950 text-amber-200 shadow-lg shadow-slate-950/10'
                  : 'border-slate-900/10 bg-white/80 text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800'
              }`}
              type="button"
            >
              {cat.label}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${category === cat.id ? 'bg-white/10 text-amber-100' : 'bg-slate-100 text-slate-500'}`}>
                {adminData.articles.filter((a) => a.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-900/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL' as const, label: 'Todos' },
              { id: 'DRAFT' as const, label: 'Borradores' },
              { id: 'PUBLISHED' as const, label: 'Publicados' },
              { id: 'ARCHIVED' as const, label: 'Archivados' },
            ].map((item) => (
              <button
                className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                  statusFilter === item.id
                    ? 'border-teal-300 bg-teal-50 text-teal-800'
                    : 'border-slate-900/10 bg-white/70 text-slate-500 hover:border-teal-300 hover:text-teal-700'
                }`}
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <FieldHint icon={Type} label="Palabras" value={String(currentWords)} />
            <FieldHint icon={CalendarClock} label="Lectura" value={`${readingMinutes(formBody)} min`} />
            <FieldHint icon={Gauge} label="Calidad" value={`${currentDraftScore}%`} />
          </div>
        </div>
      </section>

      {/* Articles List */}
      <div className="overflow-hidden rounded-lg border border-slate-900/10 bg-white/80 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 bg-white/60 px-4 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-950">
            <ClipboardCheck className="h-4 w-4 text-amber-600" />
            {category}
            <span className="text-sm font-normal text-slate-400">({filteredArticles.length} articulos)</span>
          </h2>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-amber-200">Gestion editorial</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center p-6 text-sm text-zinc-400">
            {search ? 'No se encontraron articulos.' : 'No hay contenido en esta categoria.'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredArticles.map((article) => {
              const st = statusConfig[article.status] ?? statusConfig.DRAFT;
              const StIcon = st.icon;
              return (
                <div key={article.id}>
                  <div className="grid gap-4 px-4 py-5 transition hover:bg-amber-50/40 sm:px-6 xl:grid-cols-[1fr_auto]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-lg bg-slate-950 shadow-sm ring-1 ring-slate-900/10 sm:h-20 sm:w-32">
                        {article.coverUrl ? (
                          <img src={article.coverUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-amber-300">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="truncate text-base font-black text-slate-950">{article.title}</p>
                          <span className={`admin-badge ${st.badge}`}>
                            <StIcon className="mr-1 inline h-3 w-3" />
                            {st.label}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-600">{article.excerpt}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <FieldHint icon={Tags} label="Slug" value={article.slug} />
                          <FieldHint icon={Type} label="Palabras" value={String(countWords(article.body))} />
                          <FieldHint icon={CalendarClock} label="Lectura" value={`${readingMinutes(article.body)} min`} />
                          {article.publishedAt && <FieldHint icon={Send} label="Publicado" value={new Date(article.publishedAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })} />}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      {article.status === 'DRAFT' && (
                        <Button className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all" disabled={saving} onClick={() => runAction(() => api.updateArticle(token, article.id, { status: 'PUBLISHED' }), 'Articulo publicado!')} type="button" variant="outline">
                          <CheckCircle2 className="h-3.5 w-3.5" />Publicar
                        </Button>
                      )}
                      {article.status === 'PUBLISHED' && (
                        <Button className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-all" disabled={saving} onClick={() => runAction(() => api.updateArticle(token, article.id, { status: 'ARCHIVED' }), 'Articulo archivado.')} type="button" variant="outline">
                          <Archive className="h-3.5 w-3.5" />Archivar
                        </Button>
                      )}
                      {article.status === 'ARCHIVED' && (
                        <Button className="border-zinc-300 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 transition-all" disabled={saving} onClick={() => runAction(() => api.updateArticle(token, article.id, { status: 'DRAFT' }), 'Restaurado a borrador.')} type="button" variant="outline">
                          <RotateCcw className="h-3.5 w-3.5" />Restaurar
                        </Button>
                      )}
                      <Button
                        className={`transition-all ${editingId === article.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-zinc-300 bg-white text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'}`}
                        disabled={saving}
                        onClick={() => editingId === article.id ? setEditingId(null) : startEdit(article)}
                        type="button"
                        variant="outline"
                       
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {editingId === article.id ? 'Cerrar' : 'Editar'}
                      </Button>
                      <Button
                        className="border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-all"
                        disabled={saving}
                        onClick={() => { if (window.confirm('Eliminar este articulo?')) runAction(() => api.deleteArticle(token, article.id), 'Articulo eliminado.'); }}
                        type="button"
                        variant="outline"
                       
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Edit Panel */}
                  {editingId === article.id && (
                    <div className="border-t border-slate-900/10 bg-gradient-to-b from-amber-50/70 to-white/80 px-4 py-5 sm:px-6 sm:py-6">
                      <div className="mb-5 flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950">
                          <Pencil className="h-4 w-4 text-amber-300" />
                        </span>
                        <span className="text-sm font-black text-slate-950">Editando: {article.title}</span>
                      </div>
                      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
                        <div className="grid gap-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Titulo</label>
                              <input className="admin-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Titulo" required />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Slug</label>
                              <input className="admin-input" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="Slug" />
                            </div>
                          </div>
                          <ImageUpload value={editCover} onChange={setEditCover} focalPoint={editFocal} onFocalChange={setEditFocal} label="Imagen de portada" />
                          <div className="grid gap-2">
                            <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Resumen editorial</label>
                          <textarea
                            className="admin-input min-h-20 resize-y leading-relaxed"
                            value={editExcerpt}
                            onChange={(e) => setEditExcerpt(e.target.value)}
                            placeholder="Resumen del articulo"
                            required
                          />
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Contenido</p>
                            <RichTextEditor value={editBody} onChange={setEditBody} placeholder="Escribe el contenido aqui..." minHeight={250} />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-900/10 bg-white/80 p-4">
                            <div className="grid gap-1">
                              <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Estado</span>
                            <select className="admin-input w-auto bg-white text-sm" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                              <option value="DRAFT">Borrador</option>
                              <option value="PUBLISHED">Publicado</option>
                              <option value="ARCHIVED">Archivado</option>
                            </select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button className="border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50" disabled={saving} onClick={() => setEditingId(null)} type="button" variant="outline">Cancelar</Button>
                              <Button className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-950/20 transition-all hover:shadow-lg hover:shadow-amber-950/30" disabled={saving} type="button" onClick={() => handleEditSave(article)}>
                                <Save className="h-4 w-4" />
                                {saving ? 'Guardando...' : 'Guardar cambios'}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="hidden lg:block">
                          <div className="sticky top-8 grid gap-4">
                          <EditorialChecklist
                            article={{
                              title: editTitle || article.title,
                              slug: editSlug || article.slug,
                              excerpt: editExcerpt || article.excerpt,
                              body: editBody || article.body,
                              coverUrl: editCover ?? article.coverUrl,
                            }}
                          />
                          <ArticlePreview
                            article={{
                              title: editTitle || article.title,
                              excerpt: editExcerpt || article.excerpt,
                              body: editBody || article.body,
                              coverUrl: editCover ?? article.coverUrl ?? undefined,
                              coverFocal: editFocal ?? article.coverFocal ?? undefined,
                            }}
                          />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Article Form */}
      <div className="overflow-hidden rounded-xl border border-slate-900/10 bg-white/80 shadow-[0_22px_68px_rgba(15,23,42,0.1)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 bg-slate-950 px-4 py-5 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400 text-slate-950">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Redaccion</p>
              <h2 className="text-xl font-black">Nuevo articulo en {category.toLowerCase()}</h2>
            </div>
          </div>
          <Button
            variant="outline"
            className={`transition-all ${showPreview ? 'border-amber-300 bg-amber-400 text-slate-950' : 'border-white/20 bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setShowPreview(!showPreview)}
            type="button"
           
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Editor' : 'Previsualizar'}
          </Button>
        </div>

        {showPreview ? (
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
            <ArticlePreview
              article={{
                title: formTitle || 'Sin titulo',
                excerpt: formExcerpt || 'Sin resumen',
                body: formBody || '<p>Sin contenido</p>',
                coverUrl: formCover,
                coverFocal: formFocal,
              }}
            />
            <EditorialChecklist
              article={{
                title: formTitle,
                slug: currentSlug,
                excerpt: formExcerpt,
                body: formBody,
                coverUrl: formCover,
              }}
            />
          </div>
        ) : (
          <form className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleCreate}>
            <div className="grid gap-5">
              <section className="grid gap-4 rounded-lg border border-slate-900/10 bg-white/70 p-4">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Identidad de la noticia</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-[1.35fr_0.85fr]">
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Titulo</label>
                    <input className="admin-input text-base font-bold" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} name="title" placeholder="Ej: Labranza inaugura nueva..." required />
                  </div>
                  <div className="grid gap-2">
                    <label className="flex items-center justify-between gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                      Slug
                      {currentSlug && (
                        <button
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-amber-100"
                          onClick={() => void navigator.clipboard?.writeText(currentSlug)}
                          type="button"
                        >
                          <Copy className="h-3 w-3" />
                          Copiar
                        </button>
                      )}
                    </label>
                    <input className="admin-input" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} name="slug" placeholder={currentSlug || 'slug-opcional'} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Bajada / resumen</label>
                  <textarea
                    className="admin-input min-h-24 resize-y leading-relaxed"
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    name="excerpt"
                    placeholder="Resume la noticia en una frase atractiva y clara para portada."
                    required
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-900/10 bg-white/70 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Portada y encuadre</h3>
                </div>
                <ImageUpload value={formCover} onChange={setFormCover} focalPoint={formFocal} onFocalChange={setFormFocal} label="Imagen principal" />
              </section>

              <section className="rounded-lg border border-slate-900/10 bg-white/70 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-600">Cuerpo de la noticia</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <FieldHint icon={Type} label="Palabras" value={String(currentWords)} />
                    <FieldHint icon={CalendarClock} label="Lectura" value={`${readingMinutes(formBody)} min`} />
                  </div>
                </div>
                <RichTextEditor value={formBody} onChange={setFormBody} placeholder="Escribe el contenido aqui..." minHeight={360} />
              </section>
            </div>

            <aside className="grid content-start gap-4">
              <EditorialChecklist
                article={{
                  title: formTitle,
                  slug: currentSlug,
                  excerpt: formExcerpt,
                  body: formBody,
                  coverUrl: formCover,
                }}
              />
              <section className="rounded-lg border border-slate-900/10 bg-white/75 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.07)] backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Publicacion</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Salida al sitio</h3>
                <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-900/10 bg-white/70 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    checked={formPublish}
                    onChange={(e) => setFormPublish(e.target.checked)}
                  />
                  Publicar inmediatamente
                </label>
                <div className="mt-4 grid gap-2 rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
                  <span className="font-black text-white">{formPublish ? 'Se publicara ahora' : 'Se guardara como borrador'}</span>
                  <span>Categoria: {category}</span>
                  <span>URL: /noticias/{currentSlug || 'slug-pendiente'}</span>
                </div>
                <div className="mt-4 grid gap-2">
                  <Button
                    className="h-12 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-lg shadow-amber-950/20 transition-all hover:shadow-xl hover:shadow-amber-950/30"
                    disabled={saving}
                    type="submit"
                  >
                    {formPublish ? <Send className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Guardando...' : formPublish ? 'Publicar articulo' : 'Guardar borrador'}
                  </Button>
                  <Button className="border-slate-900/10 bg-white text-slate-700 hover:bg-slate-50" onClick={resetForm} type="button" variant="outline">
                    Limpiar editor
                  </Button>
                </div>
              </section>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}


