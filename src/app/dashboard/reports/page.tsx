'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { FileText, Plus, Search, Eye, Building2, MapPin, Calendar, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ReportsListPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [reportsRes, meRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/auth/me'),
      ]);
      const data = await reportsRes.json();
      const meData = await meRes.json();

      if (Array.isArray(data)) setReports(data);
      if (meData.authenticated && meData.user) {
        setIsAdmin(meData.user.activeRole === 'ADMIN' || meData.user.activeRole === 'OWNER');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId: string) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar informes PDF.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar este informe PDF?')) return;

    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReports();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al eliminar informe');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.reportCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title="Informes de Cierre de Trabajo"
        subtitle="Historial de reportes técnicos generados y exportables a PDF"
      />

      <div className="p-4 sm:p-8 space-y-6 w-full max-w-full mx-auto">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar informe por código, cliente o ubicación..."
              className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
            />
          </div>

          <Link
            href="/dashboard/reports/new"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Informe PDF</span>
          </Link>
        </div>

        {/* REPORTS LIST */}
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando informes...</p>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-12 text-center space-y-3 shadow-material-sm">
            <FileText className="w-10 h-10 text-[#5F6368] dark:text-[#9AA0A6] mx-auto" />
            <h4 className="text-[#202124] dark:text-white font-bold font-heading">No hay informes emitidos</h4>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Genera informes de cierre de trabajo para certificar las entregas a tus clientes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-material-sm material-transition hover:border-[#DC2626]/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#DC2626] dark:text-[#EF4444] bg-[#FEF2F2] dark:bg-[#321c1c] px-2.5 py-1 rounded-sm border border-[#DC2626]/30">
                      {report.reportCode}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1 font-medium font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(report.createdAt)}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          title="Eliminar informe (Solo Admin)"
                          className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#EA4335]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-[#202124] dark:text-white flex items-center gap-2 font-heading">
                      <Building2 className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444] shrink-0" />
                      {report.clientName}
                    </h3>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#5F6368] dark:text-[#9AA0A6]" />
                      {report.location}
                    </p>
                  </div>

                  <p className="text-xs text-[#3C4043] dark:text-[#E8EAED] bg-[#F8F9FA] dark:bg-[#252526] p-3 rounded-sm border border-[#E8EAED] dark:border-[#2D2D2D] font-medium line-clamp-2">
                    {report.serviceType}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8EAED] dark:border-[#2D2D2D] flex items-center justify-between">
                  <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-bold">
                    {report.materials?.length || 0} materiales registrados
                  </span>

                  <Link
                    href={`/dashboard/reports/${report.id}`}
                    className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm flex items-center gap-1.5 material-transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver / Imprimir PDF</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
