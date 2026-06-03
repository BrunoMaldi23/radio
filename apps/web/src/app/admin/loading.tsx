import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <div className="text-center">
        <div className="admin-spinner mx-auto h-10 w-10" />
        <p className="mt-4 text-sm font-medium text-zinc-500">Cargando panel...</p>
      </div>
    </div>
  );
}


