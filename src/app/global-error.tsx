'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-[#F8F9FA] text-[#202124] flex flex-col items-center justify-center min-h-screen p-4 font-sans">
        <div className="bg-white border border-[#E8EAED] rounded-sm p-8 max-w-md w-full text-center space-y-4 shadow-md">
          <div className="w-12 h-12 bg-[#FCE8E6] border border-[#EA4335]/30 rounded-sm flex items-center justify-center text-[#EA4335] mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-[#202124]">Ocurrió un error inesperado</h2>
          <p className="text-xs text-[#5F6368] font-medium leading-relaxed">
            {error?.message || 'Error del sistema'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-[#DC2626] text-white font-bold text-xs rounded-sm shadow-sm hover:bg-[#B91C1C]"
            >
              Reintentar
            </button>
            <a
              href="/"
              className="px-4 py-2 bg-[#F8F9FA] text-[#3C4043] font-bold text-xs rounded-sm border border-[#DADCE0]"
            >
              Ir al Inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
