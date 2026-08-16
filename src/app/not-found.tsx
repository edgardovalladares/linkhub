import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-sans text-[#202124]">
      <div className="bg-white border border-[#E8EAED] rounded-sm p-8 max-w-md w-full text-center space-y-4 shadow-md">
        <div className="w-12 h-12 bg-[#FEF2F2] border border-[#DC2626]/30 rounded-sm flex items-center justify-center text-[#DC2626] mx-auto text-xl font-bold font-mono">
          404
        </div>
        <h2 className="text-lg font-bold text-[#202124]">Página no encontrada</h2>
        <p className="text-xs text-[#5F6368] font-medium leading-relaxed">
          La ruta que intentas consultar no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[#DC2626] text-white font-bold text-xs rounded-sm shadow-sm hover:bg-[#B91C1C]"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
