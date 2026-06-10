'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, Download, Heart } from 'lucide-react';
import { api } from '@/lib/api';

type AttendButtonProps = {
  articleId: number;
  initialCount?: number;
  className?: string;
};

type GalleryActionsProps = {
  articleId: number;
  title: string;
  imageUrl: string;
  initialLikes?: number;
};

function storageKey(kind: 'attend' | 'like', id: number) {
  return `radio-community-${kind}-${id}`;
}

export function AttendButton({ articleId, initialCount = 0, className = '' }: AttendButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(storageKey('attend', articleId)) === '1') {
      setDone(true);
    }
  }, [articleId]);

  async function attend() {
    if (busy || done) return;
    setBusy(true);
    setError(false);
    setDone(true);
    setCount((current) => current + 1);
    window.localStorage.setItem(storageKey('attend', articleId), '1');
    try {
      const updated = await api.attendArticle(articleId);
      setCount(updated.attendees ?? count + 1);
    } catch {
      setError(true);
      setDone(false);
      setCount((current) => Math.max(0, current - 1));
      window.localStorage.removeItem(storageKey('attend', articleId));
      window.setTimeout(() => setError(false), 1200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`community-attend-btn ${done ? 'is-done' : ''} ${error ? 'is-error' : ''} ${className}`}
      disabled={busy || done}
      onClick={attend}
      type="button"
    >
      <CalendarCheck2 className="h-4 w-4" />
      <span>{error ? 'No se pudo guardar' : done ? 'Asistencia marcada' : 'Asistire'}</span>
      <strong>{count}</strong>
    </button>
  );
}

export function GalleryActions({ articleId, title, imageUrl, initialLikes = 0 }: GalleryActionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(storageKey('like', articleId)) === '1') {
      setLiked(true);
    }
  }, [articleId]);
  const downloadName = useMemo(() => `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'galeria'}.jpg`, [title]);

  async function like() {
    if (busy || liked) return;
    setBusy(true);
    setError(false);
    setLiked(true);
    setLikes((current) => current + 1);
    window.localStorage.setItem(storageKey('like', articleId), '1');
    try {
      const updated = await api.likeArticle(articleId);
      setLikes(updated.likes ?? likes + 1);
    } catch {
      setError(true);
      setLiked(false);
      setLikes((current) => Math.max(0, current - 1));
      window.localStorage.removeItem(storageKey('like', articleId));
      window.setTimeout(() => setError(false), 1200);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="community-gallery-actions">
      <button className={`community-like-btn ${liked ? 'is-liked' : ''} ${error ? 'is-error' : ''}`} disabled={busy || liked} onClick={like} type="button">
        <Heart className="h-4 w-4" />
        <span>{error ? 'Error' : likes}</span>
      </button>
      <a className="community-download-btn" download={downloadName} href={imageUrl}>
        <Download className="h-4 w-4" />
        <span>Descargar</span>
      </a>
    </div>
  );
}
