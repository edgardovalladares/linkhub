'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Search,
  Building2,
  Calendar,
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  Edit,
  Trash2,
  Tag,
  ShoppingBag,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SelectedProductItem {
  productId: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState('MAINTENANCE'); // MAINTENANCE, REPAIR, INSTALLATION_SALE
  const [priority, setPriority] = useState('MEDIUM');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  // Diagnostic fields (for MAINTENANCE and REPAIR)
  const [problemDescription, setProblemDescription] = useState('');
  const [affectedNodesCount, setAffectedNodesCount] = useState('');
  const [inspectionFindings, setInspectionFindings] = useState('');

  // Installation & Sale linked products (for INSTALLATION_SALE)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProductItem[]>([]);
  const [chosenProductId, setChosenProductId] = useState('');
  const [chosenQty, setChosenQty] = useState(1);
  const [chosenPrice, setChosenPrice] = useState(0);

  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, clientsRes, productsRes, meRes] = await Promise.all([
        fetch('/api/work-orders'),
        fetch('/api/clients'),
        fetch('/api/products'),
        fetch('/api/auth/me'),
      ]);
      const ordersData = await ordersRes.json();
      const clientsData = await clientsRes.json();
      const productsData = await productsRes.json();
      const meData = await meRes.json();

      if (Array.isArray(ordersData)) setOrders(ordersData);
      if (Array.isArray(clientsData)) setClients(clientsData);
      if (Array.isArray(productsData)) setInventoryProducts(productsData);

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
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingOrder(null);
    setClientId(clients[0]?.id || '');
    setTitle('');
    setServiceType('MAINTENANCE');
    setPriority('MEDIUM');
    setLocation('');
    setNotes('');
    setScheduledDate('');
    setProblemDescription('');
    setAffectedNodesCount('');
    setInspectionFindings('');
    setSelectedProducts([]);
    setChosenProductId('');
    setChosenQty(1);
    setChosenPrice(0);
    setShowModal(true);
  };

  const handleProductSelectChange = (pId: string) => {
    setChosenProductId(pId);
    const found = inventoryProducts.find((p) => p.id === pId);
    if (found) {
      setChosenPrice(found.salePrice || found.unitCost || 0);
    }
  };

  const handleAddProductToOrder = () => {
    if (!chosenProductId) return;
    const found = inventoryProducts.find((p) => p.id === chosenProductId);
    if (!found) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: found.id,
        sku: found.sku || 'S/N',
        description: found.name,
        quantity: Number(chosenQty) || 1,
        unitPrice: Number(chosenPrice) || 0,
      },
    ]);

    setChosenProductId('');
    setChosenQty(1);
    setChosenPrice(0);
  };

  const handleRemoveProductFromOrder = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    setSaving(true);

    try {
      const url = editingOrder ? `/api/work-orders/${editingOrder.id}` : '/api/work-orders';
      const method = editingOrder ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title,
          serviceType,
          priority,
          location,
          notes,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
          problemDescription: serviceType !== 'INSTALLATION_SALE' ? problemDescription : undefined,
          affectedNodesCount: serviceType !== 'INSTALLATION_SALE' ? affectedNodesCount : undefined,
          inspectionFindings: serviceType !== 'INSTALLATION_SALE' ? inspectionFindings : undefined,
          selectedProducts: serviceType === 'INSTALLATION_SALE' ? selectedProducts : undefined,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar órdenes de trabajo.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta orden de trabajo?')) return;

    try {
      const res = await fetch(`/api/work-orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al eliminar orden');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.client?.name && o.client.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || o.serviceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title="Órdenes de Trabajo y Venta"
        subtitle="Mantenimiento técnico, reparación de redes, insumos e instalación con inventario"
      />

      <div className="p-6 sm:p-10 space-y-6 w-full max-w-full mx-auto">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por N° OT, título o cliente..."
                className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-xs font-bold text-[#3C4043] dark:text-[#E8EAED] focus:outline-none focus:border-[#DC2626]"
            >
              <option value="ALL">Todos los Tipos</option>
              <option value="MAINTENANCE">Mantenimiento Técnico CCTV</option>
              <option value="REPAIR">Reparación e Inspección de Redes</option>
              <option value="INSTALLATION_SALE">Instalación y Venta de Equipos</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5 font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Orden de Trabajo</span>
          </button>
        </div>

        {/* WORK ORDERS LIST */}
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando órdenes de trabajo...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-12 text-center space-y-3 shadow-material-sm">
            <Wrench className="w-10 h-10 text-[#5F6368] dark:text-[#9AA0A6] mx-auto" />
            <h4 className="text-[#202124] dark:text-white font-bold font-heading">No hay órdenes de trabajo encontradas</h4>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Crea una nueva orden para iniciar un mantenimiento, reparación o instalación.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isMaintenanceOrRepair = order.serviceType === 'MAINTENANCE' || order.serviceType === 'REPAIR';
              const linkedSale = order.sales?.[0];

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-5 sm:p-6 shadow-material-sm space-y-4 material-transition hover:border-[#DC2626]/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EAED] dark:border-[#2D2D2D]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#DC2626] dark:text-[#EF4444] bg-[#FEF2F2] dark:bg-[#321c1c] px-2.5 py-1 rounded-sm border border-[#DC2626]/30">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-sm bg-[#F8F9FA] dark:bg-[#252526] text-[#3C4043] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#383838]">
                        {order.serviceType === 'MAINTENANCE'
                          ? 'Mantenimiento Técnico CCTV'
                          : order.serviceType === 'REPAIR'
                          ? 'Reparación e Inspección de Redes'
                          : 'Instalación y Venta de Equipos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-mono">{formatDate(order.createdAt)}</span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Eliminar orden (Solo Admin)"
                          className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#EA4335]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-bold text-base text-[#202124] dark:text-white font-heading">{order.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">
                        <p className="flex items-center gap-1.5 text-[#202124] dark:text-white font-bold">
                          <Building2 className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#EF4444]" />
                          <span>{order.client?.name}</span>
                        </p>
                        {order.location && (
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{order.location}</span>
                          </p>
                        )}
                      </div>

                      {/* SERVICE SPECIFIC FIELDS DISPLAY */}
                      {isMaintenanceOrRepair ? (
                        order.diagnostic && (
                          <div className="bg-[#F8F9FA] dark:bg-[#252526] border border-[#E8EAED] dark:border-[#2D2D2D] p-3 rounded-sm text-xs space-y-1 mt-2">
                            <span className="font-bold text-[#DC2626] dark:text-[#EF4444] block text-[11px] uppercase font-heading">Diagnóstico Técnico Previo</span>
                            <p className="text-[#3C4043] dark:text-[#E8EAED]">{order.diagnostic.problemDescription}</p>
                            {order.diagnostic.inspectionFindings && (
                              <p className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px] italic">Hallazgos: {order.diagnostic.inspectionFindings}</p>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="bg-[#F8F9FA] dark:bg-[#252526] border border-[#E8EAED] dark:border-[#2D2D2D] p-3 rounded-sm text-xs space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#34A853] text-[11px] uppercase flex items-center gap-1 font-heading">
                              <ShoppingBag className="w-3.5 h-3.5" /> Equipos y Productos Vinculados
                            </span>
                            {linkedSale && (
                              <span className="font-mono text-xs font-bold text-[#202124] dark:text-white">
                                Total: L. {linkedSale.totalAmount.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {linkedSale?.items && linkedSale.items.length > 0 ? (
                            <div className="space-y-1">
                              {linkedSale.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] bg-white dark:bg-[#1E1E1E] p-1.5 border border-[#E8EAED] dark:border-[#383838] rounded-sm">
                                  <span className="font-medium text-[#202124] dark:text-white">
                                    • {item.description}
                                  </span>
                                  <span className="font-mono font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                                    {item.quantity} x L. {item.unitPrice.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[#5F6368] dark:text-[#9AA0A6] text-[11px] italic">
                              {order.notes || 'No se registraron productos en inventario.'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between items-start md:items-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E8EAED] dark:border-[#2D2D2D]">
                      <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider ${
                        order.status === 'COMPLETED'
                          ? 'bg-[#E6F4EA] dark:bg-[#1b2e21] text-[#137333] dark:text-[#34A853] border border-[#34A853]/30'
                          : 'bg-[#FEF7E0] dark:bg-[#332a15] text-[#B06000] dark:text-[#FBBC05] border border-[#FBBC05]/40'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Completado' : 'En Proceso'}
                      </span>

                      {/* PDF REPORT BUTTON (RESTRICTED TO MAINTENANCE & REPAIR) */}
                      {isMaintenanceOrRepair ? (
                        <Link
                          href={`/dashboard/reports/new?workOrderId=${order.id}`}
                          className="mt-3 w-full md:w-auto px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm flex items-center justify-center gap-1.5 material-transition font-heading"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Generar Informe PDF</span>
                        </Link>
                      ) : (
                        <span className="mt-3 text-[11px] text-[#5F6368] dark:text-[#9AA0A6] italic font-medium">
                          Venta e Instalación Registrada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* CREATE WORK ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 w-full max-w-xl space-y-4 shadow-material-lg max-h-[90vh] overflow-y-auto text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <Wrench className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
              Crear Nueva Orden de Trabajo
            </h3>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold block mb-1">Tipo de Servicio *</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-bold focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="MAINTENANCE">Mantenimiento Técnico CCTV (Genera Informe PDF)</option>
                  <option value="REPAIR">Reparación e Inspección de Redes (Genera Informe PDF)</option>
                  <option value="INSTALLATION_SALE">Instalación y Venta de Equipos (Vincula Productos)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Cliente Vinculado *</label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Ubicación / Planta</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ej: Planta 2, Edificio B"
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Título o Asunto de la Orden *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej: Instalación y venta de 4 cámaras IP y switch"
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              {/* DYNAMIC FIELDS BASED ON SERVICE TYPE */}
              {serviceType !== 'INSTALLATION_SALE' ? (
                <div className="bg-[#FEF2F2] dark:bg-[#321c1c] border border-[#DC2626]/20 p-4 rounded-sm space-y-3">
                  <span className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] uppercase tracking-wider block font-heading">
                    Campos de Diagnóstico e Inspección Previa
                  </span>

                  <div>
                    <label className="text-xs font-bold block mb-1">1. Problemática Encontrada *</label>
                    <textarea
                      rows={2}
                      required
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="Describa la falla técnica detectada (ej: Pérdida de video en 4 nodos CCTV)..."
                      className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-2.5 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Hallazgos e Inspección Técnica</label>
                    <textarea
                      rows={2}
                      value={inspectionFindings}
                      onChange={(e) => setInspectionFindings(e.target.value)}
                      placeholder="Detalle de componentes dañados, polaridad invertida, derivaciones UTP..."
                      className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-2.5 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8F9FA] dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] p-4 rounded-sm space-y-3">
                  <span className="text-xs font-bold text-[#34A853] uppercase tracking-wider block font-heading">
                    Vincular Productos del Inventario
                  </span>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={chosenProductId}
                      onChange={(e) => handleProductSelectChange(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-2.5 py-1.5 text-xs text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626]"
                    >
                      <option value="">Seleccionar producto de inventario...</option>
                      {inventoryProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku || 'S/N'} - {p.name} (Stock: {p.stockQuantity})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={chosenQty}
                      onChange={(e) => setChosenQty(Number(e.target.value))}
                      placeholder="Cant"
                      className="w-16 bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-2.5 py-1.5 text-xs text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626]"
                    />

                    <input
                      type="number"
                      step="0.01"
                      value={chosenPrice}
                      onChange={(e) => setChosenPrice(Number(e.target.value))}
                      placeholder="Precio"
                      className="w-24 bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-2.5 py-1.5 text-xs text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626]"
                    />

                    <button
                      type="button"
                      onClick={handleAddProductToOrder}
                      className="px-3 py-1.5 bg-[#34A853] hover:bg-[#2D9247] text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1 shrink-0 font-heading"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>

                  {/* LIST OF SELECTED PRODUCTS */}
                  {selectedProducts.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#E8EAED] dark:border-[#383838]">
                      {selectedProducts.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-2 border border-[#DADCE0] dark:border-[#383838] rounded-sm text-xs">
                          <div>
                            <span className="font-bold text-[#202124] dark:text-white">{item.description}</span>
                            <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block font-mono">SKU: {item.sku}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[#34A853]">
                              {item.quantity} x L. {item.unitPrice.toFixed(2)} = L. {(item.quantity * item.unitPrice).toFixed(2)}
                            </span>
                            <button type="button" onClick={() => handleRemoveProductFromOrder(idx)} className="text-[#EA4335]">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold block mb-1">Notas de Venta e Instalación</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detalles del sitio de montaje o acuerdos de instalación..."
                      className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-2.5 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8EAED] dark:border-[#2D2D2D]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#F8F9FA] dark:bg-[#252526] hover:bg-[#E8EAED] text-[#3C4043] dark:text-[#E8EAED] text-xs font-bold rounded-sm border border-[#DADCE0] dark:border-[#383838]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition disabled:opacity-50 font-heading"
                >
                  {saving ? 'Guardando...' : 'Crear Orden'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
