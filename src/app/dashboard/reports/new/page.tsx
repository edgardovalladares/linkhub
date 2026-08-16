'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ReportPDFView from '@/components/ReportPDFView';
import { FileText, ArrowLeft, ArrowRight, Check, Plus, Trash2, Download } from 'lucide-react';

interface MaterialItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export default function NewReportWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get('workOrderId');

  const [step, setStep] = useState<number>(1);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeCompany, setActiveCompany] = useState<any>(null);

  // Form states
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId || '');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('Mantenimiento y corrección del sistema de videovigilancia');

  // Step 2
  const [problematicFound, setProblematicFound] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [finalResult, setFinalResult] = useState('');
  const [technicianName, setTechnicianName] = useState('');

  // Step 3: Materials
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: '1', description: 'Video balun pasivo HD', quantity: 1, unit: 'PZA' },
  ]);
  const [newMaterialDesc, setNewMaterialDesc] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState(1);
  const [newMaterialUnit, setNewMaterialUnit] = useState('PZA');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetch('/api/work-orders'), fetch('/api/auth/me')])
      .then(async ([ordersRes, meRes]) => {
        const ordersData = await ordersRes.json();
        const meData = await meRes.json();

        if (Array.isArray(ordersData)) {
          // Filter to Maintenance, Repair, and Installation orders
          const filtered = ordersData.filter(
            (o) => o.serviceType === 'MAINTENANCE' || o.serviceType === 'REPAIR' || o.serviceType === 'INSTALLATION'
          );
          setWorkOrders(filtered);

          if (preselectedOrderId) {
            const found = filtered.find((o) => o.id === preselectedOrderId);
            if (found) fillOrderData(found);
          } else if (filtered.length > 0) {
            setSelectedOrderId(filtered[0].id);
            fillOrderData(filtered[0]);
          }
        }

        if (meData.authenticated && meData.user?.activeCompany) {
          setActiveCompany(meData.user.activeCompany);
          if (meData.user.name) setTechnicianName(meData.user.name);
        }
      })
      .finally(() => setLoadingOrders(false));
  }, [preselectedOrderId]);

  const fillOrderData = (order: any) => {
    setSelectedOrderId(order.id);
    if (order.client?.name) setClientName(order.client.name);
    if (order.location) setLocation(order.location);
    if (order.title) setServiceType(order.title);

    if (order.diagnostic) {
      if (order.diagnostic.problemDescription) setProblematicFound(order.diagnostic.problemDescription);
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedOrderId(id);
    const found = workOrders.find((o) => o.id === id);
    if (found) fillOrderData(found);
  };

  const handleAddMaterial = () => {
    if (!newMaterialDesc.trim()) return;
    setMaterials((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: newMaterialDesc,
        quantity: Number(newMaterialQty) || 1,
        unit: newMaterialUnit,
      },
    ]);
    setNewMaterialDesc('');
    setNewMaterialQty(1);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveAndGenerateReport = async () => {
    if (!clientName.trim() || !problematicFound.trim() || !workDone.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workOrderId: selectedOrderId || undefined,
          clientName,
          location,
          serviceType,
          problematicFound,
          workDone,
          finalResult,
          technicianName,
          materials: materials.map((m) => ({
            description: m.description,
            quantity: m.quantity,
            unit: m.unit,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/dashboard/reports/${data.id}`);
      } else {
        alert(data.error || 'Error al guardar informe');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header title="Generador de Informe Técnico PDF" subtitle="Formulario guiado para la emisión de reportes formales de cierre" />

      <div className="p-4 sm:p-8 space-y-6 max-w-5xl w-full mx-auto">
        
        {/* STEP PROGRESS BAR */}
        <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-sm border border-[#E8EAED] dark:border-[#2D2D2D] shadow-material-sm text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#DC2626] dark:text-[#EF4444]' : 'text-[#5F6368] dark:text-[#9AA0A6]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#DC2626] text-white' : 'bg-[#E8EAED] dark:bg-[#2D2D2D] text-[#5F6368]'}`}>1</span>
            <span className="hidden sm:inline font-heading">Datos Generales</span>
          </div>
          <div className="h-0.5 flex-1 bg-[#E8EAED] dark:bg-[#2D2D2D] mx-4" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#DC2626] dark:text-[#EF4444]' : 'text-[#5F6368] dark:text-[#9AA0A6]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#DC2626] text-white' : 'bg-[#E8EAED] dark:bg-[#2D2D2D] text-[#5F6368]'}`}>2</span>
            <span className="hidden sm:inline font-heading">Diagnóstico y Trabajos</span>
          </div>
          <div className="h-0.5 flex-1 bg-[#E8EAED] dark:bg-[#2D2D2D] mx-4" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#DC2626] dark:text-[#EF4444]' : 'text-[#5F6368] dark:text-[#9AA0A6]'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#DC2626] text-white' : 'bg-[#E8EAED] dark:bg-[#2D2D2D] text-[#5F6368]'}`}>3</span>
            <span className="hidden sm:inline font-heading">Materiales y Vista Previa</span>
          </div>
        </div>

        {/* STEP 1: GENERAL DATA */}
        {step === 1 && (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 sm:p-8 space-y-6 shadow-material-sm text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <FileText className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
              Paso 1: Vincular Orden de Trabajo y Cliente
            </h3>

            {workOrders.length > 0 && (
              <div className="bg-[#FEF2F2] dark:bg-[#321c1c] border border-[#DC2626]/20 p-4 rounded-sm space-y-2">
                <label className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] block font-heading">
                  Vincular con Orden de Trabajo (Mantenimiento / Reparación)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={handleOrderChange}
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                >
                  {workOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.client?.name} ({o.title})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Nombre del Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ej: Empresa Cliente S.A."
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                />
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">Ubicación de la Intervención *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ej: Planta Principal, Jutiquile"
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Tipo de Servicio Ejecutado *</label>
              <input
                type="text"
                required
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="ej: Mantenimiento preventivo y correctivo de sistema CCTV"
                className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E8EAED] dark:border-[#2D2D2D]">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!clientName.trim()}
                className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm flex items-center gap-2 material-transition disabled:opacity-50"
              >
                <span>Siguiente: Diagnóstico</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DIAGNOSTIC & WORK DONE */}
        {step === 2 && (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 sm:p-8 space-y-6 shadow-material-sm text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <FileText className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
              Paso 2: Secciones del Informe Técnico
            </h3>

            <div>
              <label className="text-xs font-bold block mb-1">1. Problemática Encontrada *</label>
              <textarea
                rows={3}
                required
                value={problematicFound}
                onChange={(e) => setProblematicFound(e.target.value)}
                placeholder="Describa en detalle las fallas iniciales encontradas antes del trabajo..."
                className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-3 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">2. Trabajos Realizados (Un ítem por línea) *</label>
              <textarea
                rows={4}
                required
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                placeholder="• Cambio de conectores BNC dañados&#10;• Reconfiguración de puerto IP en NVR&#10;• Limpieza de lentes en 4 cámaras..."
                className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-3 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">4. Conclusión / Resultado Final</label>
              <textarea
                rows={2}
                value={finalResult}
                onChange={(e) => setFinalResult(e.target.value)}
                placeholder="ej: El sistema quedó 100% operativo y entregado a satisfacción del cliente."
                className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-3 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-[#E8EAED] dark:border-[#2D2D2D]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-[#F8F9FA] dark:bg-[#252526] hover:bg-[#E8EAED] text-[#3C4043] dark:text-[#E8EAED] text-xs font-bold rounded-sm border border-[#DADCE0] dark:border-[#383838] flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!problematicFound.trim() || !workDone.trim()}
                className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm flex items-center gap-2 material-transition disabled:opacity-50"
              >
                <span>Siguiente: Materiales y Vista Previa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MATERIALS & PREVIEW */}
        {step === 3 && (
          <div className="space-y-6">
            
            {/* MATERIALS CARD */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 sm:p-8 space-y-4 shadow-material-sm text-[#202124] dark:text-white">
              <h3 className="text-lg font-bold font-heading">3. Materiales e Insumos Utilizados</h3>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newMaterialDesc}
                  onChange={(e) => setNewMaterialDesc(e.target.value)}
                  placeholder="ej: Conector BNC Macho a Presión"
                  className="flex-1 bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                />
                <input
                  type="number"
                  min="1"
                  value={newMaterialQty}
                  onChange={(e) => setNewMaterialQty(Number(e.target.value))}
                  className="w-20 bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                />
                <select
                  value={newMaterialUnit}
                  onChange={(e) => setNewMaterialUnit(e.target.value)}
                  className="bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="PZA">PZA</option>
                  <option value="MTS">MTS</option>
                  <option value="CAJA">CAJA</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1 shadow-material-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 bg-[#F8F9FA] dark:bg-[#252526] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm text-xs">
                    <span className="font-medium text-[#202124] dark:text-white">{m.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#DC2626] dark:text-[#EF4444]">{m.quantity} {m.unit}</span>
                      <button onClick={() => handleRemoveMaterial(m.id)} className="text-[#EA4335] hover:opacity-80">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE PREVIEW OF FORMAL PDF REPORT */}
            <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 sm:p-8 space-y-4 shadow-material-sm">
              <h3 className="text-base font-bold text-[#202124] dark:text-white font-heading">Vista Previa Formal del Documento PDF</h3>
              
              <div className="border border-[#DADCE0] dark:border-[#383838] p-4 bg-gray-100 rounded-sm">
                <ReportPDFView
                  companyName={activeCompany?.name}
                  companyLogo={activeCompany?.logoUrl}
                  companyTaxId={activeCompany?.taxId}
                  companyPhone={activeCompany?.phone}
                  companyEmail={activeCompany?.email}
                  companyAddress={activeCompany?.address}
                  reportCode="INF-2026-NUEVO"
                  clientName={clientName || 'Nombre del Cliente'}
                  location={location || 'Ubicación'}
                  serviceType={serviceType}
                  createdAt={new Date()}
                  problematicFound={problematicFound}
                  workDone={workDone}
                  materials={materials}
                  finalResult={finalResult || 'El trabajo ha sido entregado en condiciones óptimas de funcionamiento.'}
                  technicianName={technicianName}
                />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-[#F8F9FA] dark:bg-[#252526] hover:bg-[#E8EAED] text-[#3C4043] dark:text-[#E8EAED] text-xs font-bold rounded-sm border border-[#DADCE0] dark:border-[#383838] flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndGenerateReport}
                disabled={submitting}
                className="px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-md flex items-center gap-2 material-transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{submitting ? 'Emitiendo Informe...' : 'Guardar y Descargar PDF'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
