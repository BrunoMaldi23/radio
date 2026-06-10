'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, type StreamingRuntimeStatus } from '@/lib/api';

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${
      ok
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'
    }`}>
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)]' : 'bg-rose-500'}`} />
      {label}: {ok ? 'OK' : 'No listo'}
    </span>
  );
}

export function StreamRuntimePanel() {
  const [status, setStatus] = useState<StreamingRuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const tvPath = useMemo(
    () => status?.mediamtx.paths?.items?.find((item) => item.name === 'tv') ?? null,
    [status]
  );

  const hlsReaders = tvPath?.readers?.filter((r: { type: string }) => r.type === 'hlsSession').length ?? 0;
  const totalReaders = tvPath?.readers?.length ?? 0;

  async function refresh() {
    setLoading(true);
    try {
      setStatus(await api.streamingRuntimeStatus());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(refresh, 7000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="admin-shell-frame overflow-hidden rounded-lg">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-900/10 bg-white/70 p-5 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-black text-[#0f172a]">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#020617] text-amber-200">
            <Activity className="h-5 w-5" />
          </span>
          Estado de senales
        </h2>
        <Button disabled={loading} onClick={refresh} type="button" variant="outline">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-wrap content-start gap-2">
          <StatusPill label="MediaMTX API" ok={Boolean(status?.mediamtx.ok)} />
          <StatusPill label="Icecast /radio" ok={Boolean(status?.icecast.ok)} />
          <StatusPill label="HLS /tv" ok={Boolean(status?.hls.ok)} />
        </div>

        <div className="rounded-lg border border-slate-900/10 bg-slate-50/85 p-4">
          <p className="text-sm font-black text-[#0f172a]">Path TV</p>
          <div className="mt-2 grid gap-2 text-sm text-slate-600">
            <p>Estado: <strong className="text-[#0f172a]">{tvPath?.ready ? 'Transmitiendo' : 'Esperando OBS'}</strong></p>
            <p>Fuente: <strong className="text-[#0f172a]">{tvPath?.source?.type ?? 'Sin fuente'}</strong></p>
            <p>Tracks: <strong className="text-[#0f172a]">{tvPath?.tracks?.join(', ') || 'Sin tracks'}</strong></p>
            <p>Espectadores HLS: <strong className="text-[#0f172a]">{hlsReaders}</strong> <span className="text-xs text-slate-400">({totalReaders} total conexiones)</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
