'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { Clock, FileText, AlertTriangle, Users, ChevronRight, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DashboardClientPageProps {
  user: any;
  workOrdersCount: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  clientsCount: number;
  reportsCount: number;
  recentOrders: any[];
  recentReports: any[];
}

export default function DashboardClientPage({
  user,
  workOrdersCount,
  pendingOrdersCount,
  lowStockCount,
  clientsCount,
  reportsCount,
  recentOrders,
  recentReports,
}: DashboardClientPageProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title={`Panel Principal - ${user.activeCompany.name}`}
        subtitle="Resumen operativo de instalaciones, diagnósticos y reportes emitidos"
      />

      <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 w-full max-w-full mx-auto">
        
        {/* MATERIAL AI STATS CARDS WITH DARK MODE & MOBILE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] p-4 sm:p-5 rounded-sm shadow-material-sm flex items-center justify-between material-transition hover:-translate-y-0.5">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider font-heading">Órdenes Pendientes</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-white mt-1 font-heading">{pendingOrdersCount}</h3>
              <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] mt-1">de {workOrdersCount} órdenes totales</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FEF7E0] dark:bg-[#332a15] border border-[#FBBC05]/40 rounded-sm flex items-center justify-center text-[#B06000] dark:text-[#FBBC05] shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] p-4 sm:p-5 rounded-sm shadow-material-sm flex items-center justify-between material-transition hover:-translate-y-0.5">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider font-heading">Informes Emitidos</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-white mt-1 font-heading">{reportsCount}</h3>
              <p className="text-[11px] text-[#DC2626] dark:text-[#EF4444] font-bold mt-1">PDFs generados</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FEF2F2] dark:bg-[#321c1c] border border-[#DC2626]/30 rounded-sm flex items-center justify-center text-[#DC2626] dark:text-[#EF4444] shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] p-4 sm:p-5 rounded-sm shadow-material-sm flex items-center justify-between material-transition hover:-translate-y-0.5">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider font-heading">Bajo Stock Alerta</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-white mt-1 font-heading">{lowStockCount}</h3>
              <p className="text-[11px] text-[#EA4335] font-bold mt-1">requieren reabastecimiento</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FCE8E6] dark:bg-[#321c1c] border border-[#EA4335]/30 rounded-sm flex items-center justify-center text-[#C5221F] dark:text-[#EA4335] shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] p-4 sm:p-5 rounded-sm shadow-material-sm flex items-center justify-between material-transition hover:-translate-y-0.5">
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider font-heading">Clientes Activos</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202124] dark:text-white mt-1 font-heading">{clientsCount}</h3>
              <p className="text-[11px] text-[#34A853] font-bold mt-1">empresas y particulares</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E6F4EA] dark:bg-[#1b2e21] border border-[#34A853]/30 rounded-sm flex items-center justify-center text-[#137333] dark:text-[#34A853] shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

        </div>

        {/* TWO COLUMN ASYMMETRIC GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* RECENT WORK ORDERS (2 COLS) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-4 sm:p-6 shadow-material-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8EAED] dark:border-[#2D2D2D]">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#202124] dark:text-white font-heading">Órdenes de Trabajo Recientes</h3>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Proyectos de instalación, mantenimiento y diagnóstico</p>
              </div>
              <Link
                href="/dashboard/work-orders"
                className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] hover:underline flex items-center gap-1 shrink-0"
              >
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] py-6 text-center font-medium">No hay órdenes de trabajo registradas.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 sm:p-4 bg-[#F8F9FA] dark:bg-[#252526] rounded-sm border border-[#E8EAED] dark:border-[#2D2D2D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 material-transition hover:border-[#DC2626]/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#DC2626] dark:text-[#EF4444]">{order.orderNumber}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-white dark:bg-[#1E1E1E] text-[#3C4043] dark:text-[#E8EAED] border border-[#E8EAED] dark:border-[#383838]">
                          {order.serviceType === 'MAINTENANCE' ? 'Mantenimiento' : order.serviceType === 'REPAIR' ? 'Reparación' : 'Instalación'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#202124] dark:text-white font-heading">{order.title}</p>
                      <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">Cliente: <strong className="text-[#202124] dark:text-white">{order.client?.name}</strong> • {order.location || 'N/A'}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                        order.status === 'COMPLETED'
                          ? 'bg-[#E6F4EA] dark:bg-[#1b2e21] text-[#137333] dark:text-[#34A853] border border-[#34A853]/30'
                          : order.status === 'DIAGNOSED'
                          ? 'bg-[#FEF7E0] dark:bg-[#332a15] text-[#B06000] dark:text-[#FBBC05] border border-[#FBBC05]/40'
                          : 'bg-[#FEF2F2] dark:bg-[#321c1c] text-[#DC2626] dark:text-[#EF4444] border border-[#DC2626]/30'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Concluido' : order.status === 'DIAGNOSED' ? 'Con Diagnóstico' : 'En Proceso'}
                      </span>
                      <p className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] font-mono">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RECENT REPORTS (1 COL) */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-4 sm:p-6 shadow-material-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8EAED] dark:border-[#2D2D2D]">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#202124] dark:text-white font-heading">Informes de Cierre</h3>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">PDFs listos para imprimir</p>
              </div>
              <Link
                href="/dashboard/reports"
                className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] hover:underline flex items-center gap-1 shrink-0"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentReports.length === 0 ? (
                <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6] py-6 text-center font-medium">No hay informes generados.</p>
              ) : (
                recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 bg-[#F8F9FA] dark:bg-[#252526] rounded-sm border border-[#E8EAED] dark:border-[#2D2D2D] flex items-center justify-between material-transition hover:border-[#DC2626]/40"
                  >
                    <div>
                      <span className="font-mono text-[11px] font-bold text-[#DC2626] dark:text-[#EF4444] block">{report.reportCode}</span>
                      <p className="text-xs font-bold text-[#202124] dark:text-white truncate max-w-[150px] font-heading">{report.clientName}</p>
                      <p className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6]">{report.location}</p>
                    </div>

                    <Link
                      href={`/dashboard/reports/${report.id}`}
                      className="px-3 py-1.5 rounded-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center gap-1 shadow-material-sm material-transition shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
