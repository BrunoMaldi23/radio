'use client';

import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

type SubmissionType = 'Eventos' | 'Galeria';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CommunitySubmissionForm() {
  const [category, setCategory] = useState<SubmissionType>('Galeria');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const excerpt = String(form.get('excerpt') ?? '').trim();
    const details = String(form.get('body') ?? '').trim();
    const url = String(form.get('imageUrl') ?? '').trim();
    const file = form.get('imageFile');

    setBusy(true);
    try {
      let coverUrl: string | undefined;
      if (file instanceof File && file.size > 0) {
        const uploaded = await api.uploadPublicImage(file);
        coverUrl = uploaded.url;
      } else if (url) {
        const uploaded = await api.uploadPublicImageFromUrl(url);
        coverUrl = uploaded.url;
      }

      await api.createCommunitySubmission({
        title,
        slug: slugify(title),
        excerpt,
        body: details || excerpt,
        category,
        coverUrl,
      });

      event.currentTarget.reset();
      setCategory('Galeria');
      toast.success('Aporte recibido. El equipo lo revisara antes de publicarlo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar el aporte.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="radio-panel rounded-lg p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-amber-300">
          <ImagePlus className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-black text-slate-950">Comparte con la comunidad</h2>
          <p className="text-sm text-slate-500">Puedes enviar un evento o una imagen para la galeria.</p>
        </div>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-900/10 bg-white/70 p-1">
          {(['Galeria', 'Eventos'] as SubmissionType[]).map((item) => (
            <button
              className={`h-10 rounded-md text-sm font-black transition ${
                category === item ? 'bg-slate-950 text-amber-200' : 'text-slate-500 hover:bg-amber-100 hover:text-slate-950'
              }`}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <input className="admin-input" name="title" placeholder={category === 'Eventos' ? 'Nombre del evento' : 'Titulo de la imagen'} required />
        <textarea className="admin-input min-h-24 resize-y" name="excerpt" placeholder="Descripcion breve" required />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black text-slate-500">Subir imagen local</span>
            <span className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white/75 px-3 text-sm font-bold text-slate-600 transition hover:border-amber-500 hover:bg-amber-50">
              <ImagePlus className="h-4 w-4 text-amber-600" />
              JPG, PNG, WEBP o GIF
              <input accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" name="imageFile" type="file" />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black text-slate-500">O importar desde URL</span>
            <input className="admin-input" name="imageUrl" placeholder="https://..." type="url" />
          </label>
        </div>
        <textarea className="admin-input min-h-24 resize-y" name="body" placeholder="Detalle opcional" />
        <Button className="admin-action-save h-11" disabled={busy} type="submit">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {busy ? 'Enviando...' : 'Enviar aporte'}
        </Button>
      </form>
    </section>
  );
}
