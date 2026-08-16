'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';

interface MaterialItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
}

interface ReportPDFViewProps {
  companyName?: string;
  companyLogo?: string | null;
  companyTaxId?: string | null;
  companyPhone?: string | null;
  companyEmail?: string | null;
  companyAddress?: string | null;
  reportCode: string;
  clientName: string;
  location: string;
  serviceType: string;
  createdAt?: string | Date;
  problematicFound: string;
  workDone: string;
  finalResult: string;
  technicianName?: string;
  materials: MaterialItem[];
}

export default function ReportPDFView({
  companyName = 'Empresa Prestadora de Servicios',
  companyLogo,
  companyTaxId,
  companyPhone,
  companyEmail,
  companyAddress,
  reportCode,
  clientName,
  location,
  serviceType,
  createdAt = new Date(),
  problematicFound,
  workDone,
  finalResult,
  technicianName = 'Técnico Responsable',
  materials = [],
}: ReportPDFViewProps) {
  const workDoneLines = workDone
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div
      id="pdf-report-container"
      className="bg-white text-[#1E293B] p-8 sm:p-12 border border-gray-200 rounded-none print-page max-w-4xl mx-auto font-sans leading-relaxed shadow-sm space-y-6"
    >
      {/* BRANDING HEADER - ACTIVE COMPANY LOGO & CONTACT DATA */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-900 pb-5 gap-6">
        <div className="flex items-center gap-4">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="h-16 w-auto object-contain max-w-[180px]"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-900 text-white flex items-center justify-center font-bold text-2xl rounded-xs shrink-0 font-heading">
              {companyName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase font-heading">
              {companyName}
            </h1>
            {companyTaxId && <p className="text-xs text-gray-700 font-bold mt-0.5">RTN / ID Fiscal: {companyTaxId}</p>}
            {companyAddress && <p className="text-xs text-gray-600 mt-0.5">{companyAddress}</p>}
            <div className="flex flex-wrap gap-x-4 text-xs text-gray-600 mt-0.5 font-mono">
              {companyPhone && <span>Tel: {companyPhone}</span>}
              {companyEmail && <span>Email: {companyEmail}</span>}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="bg-gray-900 text-white px-3 py-1.5 text-xs font-mono font-bold tracking-widest inline-block uppercase">
            N° INFORME: {reportCode}
          </div>
          <p className="text-xs text-gray-600 mt-2 font-mono font-semibold">Fecha: {formatDate(createdAt)}</p>
        </div>
      </div>

      {/* DOCUMENT TITLE BANNER */}
      <div className="bg-gray-100 border border-gray-300 px-4 py-2.5 text-center">
        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest font-heading">
          INFORME TÉCNICO DE CIERRE Y ENTREGA DE TRABAJO
        </h2>
      </div>

      {/* METADATA GRID TABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-300 divide-y sm:divide-y-0 sm:divide-x divide-gray-300 text-xs">
        <div className="p-3 bg-gray-50/50 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cliente / Empresa Recipiente:</p>
          <p className="font-extrabold text-gray-900 text-sm font-heading">{clientName}</p>
          <p className="text-xs text-gray-600">Ubicación: <strong className="text-gray-900">{location}</strong></p>
        </div>

        <div className="p-3 bg-gray-50/50 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Detalles del Servicio:</p>
          <p className="font-bold text-gray-900 font-heading">{serviceType}</p>
          <p className="text-xs text-gray-600">Técnico Responsable: <strong className="text-gray-900">{technicianName}</strong></p>
        </div>
      </div>

      {/* SECCION 1. DIAGNOSTICO E INSPECCION PREVIA */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-gray-900 pb-1">
          <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
            Diagnóstico e Inspección Previa
          </h3>
        </div>
        <div className="p-3.5 bg-gray-50 border-l-4 border-gray-900 text-xs text-gray-800 leading-relaxed text-justify font-normal">
          {problematicFound}
        </div>
      </div>

      {/* SECCION 2. TRABAJOS REALIZADOS */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-gray-900 pb-1">
          <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
            Detalle de Actividades y Trabajos Ejecutados
          </h3>
        </div>
        <div className="space-y-2 pl-2">
          {workDoneLines.map((line, idx) => {
            const cleanText = line.replace(/^[•\-\*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-800">
                <span className="text-gray-900 font-bold text-sm leading-none">✓</span>
                <span className="leading-relaxed">{cleanText}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCION 3. MATERIALES E INSUMOS */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-gray-900 pb-1">
          <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
            Materiales, Equipos e Insumos Instalados
          </h3>
        </div>
        {materials.length === 0 ? (
          <p className="text-xs text-gray-500 italic pl-2">No se requirió el uso de insumos adicionales.</p>
        ) : (
          <table className="w-full text-left border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider font-heading">
                <th className="p-2 border-r border-gray-700 w-12 text-center">#</th>
                <th className="p-2 border-r border-gray-700">Descripción del Material / Equipo</th>
                <th className="p-2 w-28 text-center">Cantidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {materials.map((m, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 border-r border-gray-300 text-center font-mono font-bold text-gray-600">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-300 text-gray-900 font-medium">{m.description}</td>
                  <td className="p-2 text-center font-mono font-bold text-gray-900">{m.quantity || 1} {m.unit || 'PZA'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SECCION 4. RESULTADO FINAL */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 border-b border-gray-900 pb-1">
          <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-heading">
            Conclusión Técnica y Entrega Satisfactoria
          </h3>
        </div>
        <div className="p-3.5 bg-gray-50 border-l-4 border-gray-900 text-xs text-gray-800 leading-relaxed text-justify font-normal">
          {finalResult}
        </div>
      </div>

      {/* FOOTER: ONLY "Información proporcionada por: [Logo LinkHub]" */}
      <div className="pt-6 border-t border-gray-300 flex items-center justify-end gap-2 text-xs text-gray-600 font-medium">
        <span>Información proporcionada por:</span>
        <img
          src="https://i.ibb.co/dwNZT57W/linkhub.png"
          alt="LinkHub"
          className="h-6 w-auto object-contain"
        />
      </div>

    </div>
  );
}
