'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      return;
    }
    console.error('Unhandled app error:', error);
  }, [error]);

  if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center font-sans text-[#202124]">
      <div className="bg-white border border-[#E8EAED] rounded-sm p-8 max-w-md w-full shadow-material-lg space-y-4">
        <div className="w-12 h-12 bg-[#FCE8E6] border border-[#EA4335]/30 rounded-sm flex items-center justify-center text-[#EA4335] mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-[#202124]">Ocurrió un error inesperado</h2>
        <p className="text-xs text-[#5F6368] font-medium leading-relaxed">
          {error.message || 'Se produjo una interrupción en el sistema. Puedes reintentar la acción o volver al inicio.'}
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm flex items-center gap-2 material-transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-[#F8F9FA] hover:bg-[#E8EAED] text-[#3C4043] text-xs font-bold rounded-sm border border-[#DADCE0]"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
