'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReportPDFView from '@/components/ReportPDFView';
import { ArrowLeft, Download, Share2, Check } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setReport(data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-report-container');
    if (!element) return;
    setDownloading(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const fileName = `Informe_${report?.reportCode || 'Cierre'}.pdf`;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: fileName,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      };

      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8F9FA] dark:bg-[#121212] text-[#5F6368] dark:text-[#9AA0A6] text-sm font-medium">
        Cargando informe PDF...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#121212] text-[#3C4043] dark:text-[#E8EAED] space-y-4">
        <p className="text-base font-bold text-[#202124] dark:text-white font-heading">Informe no encontrado</p>
        <button
          onClick={() => router.push('/dashboard/reports')}
          className="px-4 py-2 bg-[#DC2626] text-white text-xs font-bold rounded-sm shadow-material-sm"
        >
          Volver a informes
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] font-sans text-[#202124] dark:text-[#E8EAED]">
      
      {/* NO PRINT TOP ACTION BAR */}
      <div className="no-print bg-white dark:bg-[#1E1E1E] border-b border-[#E8EAED] dark:border-[#2D2D2D] px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-[100] shadow-material-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="p-2 bg-[#F8F9FA] dark:bg-[#2D2D2D] hover:bg-[#E8EAED] dark:hover:bg-[#383838] rounded-sm text-[#3C4043] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#383838] material-transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#202124] dark:text-white flex items-center gap-2 font-heading">
              Informe: <span className="font-mono text-[#DC2626] dark:text-[#EF4444]">{report.reportCode}</span>
            </h1>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Empresa: {report.company?.name || 'Tu Empresa'} • Cliente: {report.clientName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <ThemeToggle />

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white dark:bg-[#2D2D2D] hover:bg-[#F8F9FA] dark:hover:bg-[#383838] text-[#3C4043] dark:text-[#E8EAED] text-xs font-bold rounded-sm border border-[#DADCE0] dark:border-[#383838] flex items-center gap-1.5 material-transition shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-[#34A853]" /> : <Share2 className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6]" />}
            <span className="hidden sm:inline">{copied ? 'Enlace Copiado' : 'Compartir'}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm flex items-center gap-2 material-transition hover:-translate-y-0.5 disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generando PDF...' : 'Descargar PDF Directo'}</span>
          </button>
        </div>
      </div>

      {/* PDF DOCUMENT CONTAINER WITH ACTIVE USER COMPANY BRANDING */}
      <div className="p-4 sm:p-8 flex-1 overflow-y-auto">
        <ReportPDFView
          companyName={report.company?.name}
          companyLogo={report.company?.logoUrl}
          companyTaxId={report.company?.taxId}
          companyPhone={report.company?.phone}
          companyEmail={report.company?.email}
          companyAddress={report.company?.address}
          reportCode={report.reportCode}
          clientName={report.clientName}
          location={report.location}
          serviceType={report.serviceType}
          createdAt={report.createdAt}
          problematicFound={report.problematicFound}
          workDone={report.workDone}
          materials={report.materials}
          finalResult={report.finalResult}
          technicianName={report.technicianName || report.createdBy?.name}
        />
      </div>

    </div>
  );
}
