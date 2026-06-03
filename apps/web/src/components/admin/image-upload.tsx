'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileImage, Move, X } from 'lucide-react';

function parseFocal(focal: string | undefined | null): { x: number; y: number } {
  if (!focal) return { x: 50, y: 50 };
  const [x, y] = focal.split(' ').map(Number);
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
}

export function ImageUpload({
  value,
  onChange,
  focalPoint,
  onFocalChange,
  label = 'Imagen',
}: {
  value: string | undefined | null;
  onChange: (url: string | undefined) => void;
  focalPoint?: string | undefined | null;
  onFocalChange?: (focal: string) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const focal = parseFocal(focalPoint);
  const src = preview ?? value ?? '';

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    handleMove(e.clientX, e.clientY);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el || !onFocalChange) return;
    const rect = el.getBoundingClientRect();
    const x = Math.round(((clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((clientY - rect.top) / rect.height) * 100);
    onFocalChange(`${Math.max(0, Math.min(100, x))} ${Math.max(0, Math.min(100, y))}`);
  }, [onFocalChange]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, handleMove]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          <span className="block text-sm font-black text-slate-800">{label}</span>
          <span className="block text-xs text-slate-500">Usa una imagen horizontal y ajusta el punto focal si hace falta.</span>
        </span>
        <div className="flex gap-1 rounded-md border border-slate-900/10 bg-white/70 p-0.5">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`rounded px-3 py-1.5 text-xs font-black transition ${mode === 'url' ? 'bg-slate-950 text-amber-200' : 'text-slate-500 hover:bg-amber-50 hover:text-amber-800'}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`rounded px-3 py-1.5 text-xs font-black transition ${mode === 'file' ? 'bg-slate-950 text-amber-200' : 'text-slate-500 hover:bg-amber-50 hover:text-amber-800'}`}
          >
            Subir
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <input
          className="admin-input"
          type="url"
          placeholder="https://..."
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      ) : (
        <label className="flex min-h-32 cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white/70 px-3 text-sm font-semibold text-slate-600 transition hover:border-amber-400 hover:bg-amber-50">
          {src ? (
            <div className="relative w-full">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                className="relative mx-auto aspect-[16/7] w-full cursor-grab overflow-hidden rounded-lg bg-slate-950 ring-1 ring-slate-900/10 active:cursor-grabbing"
              >
                <img
                  src={src}
                  alt="Preview"
                  className="pointer-events-none h-full w-full select-none"
                  style={{ objectFit: 'cover', objectPosition: `${focal.x}% ${focal.y}%` }}
                  draggable={false}
                />
                {onFocalChange && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                      <Move className="h-3 w-3" />
                      Arrastra para ajustar
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = '';
                  onChange(undefined);
                }}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <FileImage className="h-5 w-5 text-amber-600" />
              <span>JPG, PNG, WEBP o GIF para portada</span>
            </>
          )}
          <input
            ref={fileRef}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            name="coverFile"
            type="file"
            onChange={handleFile}
          />
        </label>
      )}
    </div>
  );
}
