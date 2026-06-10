'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Link2, Loader2, Trash2, Upload, X } from 'lucide-react';
import { API_URL, api } from '@/lib/api';

function joinApiPath(path: string) {
  const base = API_URL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

function normalizeExistingUploadUrl(value: string) {
  const clean = value.trim();
  if (!clean) return '';

  if (clean.startsWith('/api/uploads/')) return clean;
  if (clean.startsWith('/uploads/')) return joinApiPath(clean);

  try {
    const parsed = new URL(clean, window.location.origin);
    if (parsed.origin === window.location.origin) {
      if (parsed.pathname.startsWith('/api/uploads/')) return `${parsed.pathname}${parsed.search}`;
      if (parsed.pathname.startsWith('/uploads/')) return joinApiPath(`${parsed.pathname}${parsed.search}`);
    }
  } catch {
    return '';
  }

  return '';
}

export function ImageUpload({
  value,
  onChange,
  token,
  label = 'Imagen',
  focalPoint,
  onFocalChange,
}: {
  value: string | undefined | null;
  onChange: (url: string | undefined) => void;
  token: string | undefined;
  label?: string;
  focalPoint?: string;
  onFocalChange?: (focal: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value ?? '');
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const src = preview ?? value ?? '';

  useEffect(() => {
    setUrlInput(value ?? '');
  }, [value]);

  const handleFile = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const uploaded = await api.uploadImage(token, file);
      onChange(uploaded.url);
      setPreview(null);
      toast.success('Imagen subida al servidor.');
    } catch (error) {
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  }, [onChange, token]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await handleFile(file);
  }, [handleFile]);

  const importUrl = useCallback(async () => {
    const nextUrl = urlInput.trim();
    if (!nextUrl) return;

    setUploading(true);
    try {
      const existingUploadUrl = normalizeExistingUploadUrl(nextUrl);
      if (existingUploadUrl) {
        onChange(existingUploadUrl);
        toast.success('Imagen asignada.');
        setShowUrl(false);
        return;
      }
      const uploaded = await api.uploadImageFromUrl(token, nextUrl);
      onChange(uploaded.url);
      toast.success('Imagen importada.');
      setShowUrl(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo importar.');
    } finally {
      setUploading(false);
    }
  }, [onChange, token, urlInput]);

  if (src) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[16/6] w-full overflow-hidden bg-slate-100">
          <img alt="" className="h-full w-full object-cover" src={src} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-xs font-black text-slate-800 shadow-lg backdrop-blur transition hover:bg-white active:scale-95"
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            <Upload className="h-3.5 w-3.5" />
            Cambiar
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur transition hover:bg-rose-600 active:scale-95"
            onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; onChange(undefined); }}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Quitar
          </button>
        </div>
        <input
          ref={fileRef}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          name="coverFile"
          type="file"
          onChange={handleFileInput}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-3 transition-all hover:border-amber-300 hover:bg-amber-50/50"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 transition-all group-hover:bg-amber-100 group-hover:text-amber-600">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-700 group-hover:text-amber-800">
            {uploading ? 'Subiendo...' : label}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Haz clic o arrastra una imagen · JPG, PNG, WEBP</p>
        </div>
        {!showUrl && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowUrl(true); }}
            className="ml-auto shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            type="button"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-200/15"
            type="text"
            placeholder="https://...o /api/uploads/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') importUrl(); }}
          />
          <button
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-4 text-xs font-black text-amber-200 shadow-sm transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
            disabled={uploading}
            onClick={importUrl}
            type="button"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Importar
          </button>
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
            onClick={() => setShowUrl(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        name="coverFile"
        type="file"
        onChange={handleFileInput}
      />
    </div>
  );
}
