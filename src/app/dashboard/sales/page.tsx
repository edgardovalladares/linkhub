'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  ShoppingBag,
  Plus,
  Search,
  Building2,
  Calendar,
  CreditCard,
  Trash2,
  Eye,
  Wrench,
  Package,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SaleItemInput {
  productId: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [clientId, setClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, TRANSFER, CARD
  const [notes, setNotes] = useState('');

  // Item Picker
  const [selectedItems, setSelectedItems] = useState<SaleItemInput[]>([]);
  const [chosenProductId, setChosenProductId] = useState('');
  const [chosenQty, setChosenQty] = useState(1);
  const [chosenPrice, setChosenPrice] = useState(0);

  // Installation Order linking
  const [createInstallationOrder, setCreateInstallationOrder] = useState(true);
  const [installationTitle, setInstallationTitle] = useState('');
  const [installationLocation, setInstallationLocation] = useState('');

  const [saving, setSaving] = useState(false);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [salesRes, clientsRes, productsRes, meRes] = await Promise.all([
        fetch('/api/sales'),
        fetch('/api/clients'),
        fetch('/api/products'),
        fetch('/api/auth/me'),
      ]);

      const salesData = await salesRes.json();
      const clientsData = await clientsRes.json();
      const productsData = await productsRes.json();
      const meData = await meRes.json();

      if (Array.isArray(salesData)) setSales(salesData);
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
    fetchSalesData();
  }, []);

  const openCreateModal = () => {
    setClientId(clients[0]?.id || '');
    setPaymentMethod('CASH');
    setNotes('');
    setSelectedItems([]);
    setChosenProductId('');
    setChosenQty(1);
    setChosenPrice(0);
    setCreateInstallationOrder(true);
    setInstallationTitle('');
    setInstallationLocation('');
    setShowModal(true);
  };

  const handleProductSelectChange = (pId: string) => {
    setChosenProductId(pId);
    const found = inventoryProducts.find((p) => p.id === pId);
    if (found) {
      setChosenPrice(found.salePrice || found.unitCost || 0);
    }
  };

  const handleAddItem = () => {
    if (!chosenProductId) return;
    const found = inventoryProducts.find((p) => p.id === chosenProductId);
    if (!found) return;

    setSelectedItems((prev) => [
      ...prev,
      {
        productId: found.id,
        sku: found.sku || 'S/N',
        description: found.name,
        quantity: Math.max(1, Number(chosenQty) || 1),
        unitPrice: Math.max(0, Number(chosenPrice) || 0),
      },
    ]);

    setChosenProductId('');
    setChosenQty(1);
    setChosenPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Agrega al menos un producto a la venta.');
      return;
    }
    setSaving(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          paymentMethod,
          notes,
          items: selectedItems,
          createInstallationOrder,
          installationTitle,
          installationLocation,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchSalesData();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar la venta');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSale = async (saleId: string, invoiceNumber: string) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden anular ventas.');
      return;
    }
    if (!confirm(`¿Estás seguro de anular la factura ${invoiceNumber}? El stock será devuelto al inventario.`)) return;

    try {
      const res = await fetch(`/api/sales/${saleId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSalesData();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al anular venta');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.client?.name && s.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title="Gestión de Ventas y Facturación"
        subtitle="Registro de ventas de productos, equipos de videovigilancia y vinculación a instalaciones"
      />

      <div className="p-6 sm:p-10 space-y-6 w-full max-w-full mx-auto">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar venta por N° Factura o cliente..."
              className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5 font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nueva Venta</span>
          </button>
        </div>

        {/* SALES GRID */}
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando ventas...</p>
        ) : filteredSales.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-12 text-center space-y-3 shadow-material-sm">
            <ShoppingBag className="w-10 h-10 text-[#5F6368] dark:text-[#9AA0A6] mx-auto" />
            <h4 className="text-[#202124] dark:text-white font-bold font-heading">No se registraron ventas</h4>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Registra las ventas de equipos y cámaras de tus clientes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-material-sm material-transition hover:border-[#DC2626]/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#34A853] bg-[#E6F4EA] dark:bg-[#1b2e21] px-2.5 py-1 rounded-sm border border-[#34A853]/30">
                      {sale.invoiceNumber}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1 font-medium font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(sale.createdAt)}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteSale(sale.id, sale.invoiceNumber)}
                          title="Anular Venta (Solo Admin)"
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
                      {sale.client?.name || 'Cliente Genérico'}
                    </h3>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-1 flex items-center gap-2 font-medium">
                      <CreditCard className="w-3.5 h-3.5 text-[#5F6368] dark:text-[#9AA0A6]" />
                      <span>Pago: <strong>{sale.paymentMethod === 'CASH' ? 'Efectivo' : sale.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta'}</strong></span>
                    </p>
                  </div>

                  {/* ITEMS SUMMARY TABLE */}
                  <div className="bg-[#F8F9FA] dark:bg-[#252526] p-3 rounded-sm border border-[#E8EAED] dark:border-[#2D2D2D] space-y-1.5 text-xs">
                    <span className="font-bold text-[#5F6368] dark:text-[#9AA0A6] block text-[10px] uppercase font-heading">
                      Detalle de Equipos Vendidos ({sale.items?.length || 0})
                    </span>
                    {sale.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-[#202124] dark:text-white truncate max-w-[200px]">
                          • {item.description}
                        </span>
                        <span className="font-mono font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                          {item.quantity} x L. {item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8EAED] dark:border-[#2D2D2D] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block uppercase font-bold">Total Venta</span>
                    <span className="text-base font-bold text-[#202124] dark:text-white font-mono">
                      L. {sale.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {sale.workOrder ? (
                    <span className="px-2.5 py-1 bg-[#FEF2F2] dark:bg-[#321c1c] text-[#DC2626] dark:text-[#EF4444] border border-[#DC2626]/30 text-[11px] font-bold rounded-sm flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> OT {sale.workOrder.orderNumber}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] italic font-medium">
                      Venta Directa
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE SALE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 w-full max-w-xl space-y-4 shadow-material-lg max-h-[90vh] overflow-y-auto text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <ShoppingBag className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
              Registrar Nueva Venta de Equipos
            </h3>

            <form onSubmit={handleSaveSale} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Cliente *</label>
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
                  <label className="text-xs font-bold block mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                  >
                    <option value="CASH">Efectivo</option>
                    <option value="TRANSFER">Transferencia Bancaria</option>
                    <option value="CARD">Tarjeta de Crédito / Débito</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTS SELECTOR SECTION */}
              <div className="bg-[#F8F9FA] dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] p-4 rounded-sm space-y-3">
                <span className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] uppercase tracking-wider block font-heading">
                  Seleccionar Equipos e Insumos del Inventario
                </span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={chosenProductId}
                    onChange={(e) => handleProductSelectChange(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-2.5 py-1.5 text-xs text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626]"
                  >
                    <option value="">Seleccionar producto...</option>
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
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm flex items-center justify-center gap-1 shrink-0 font-heading"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                {/* SELECTED ITEMS TABLE */}
                {selectedItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#E8EAED] dark:border-[#383838]">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-2 border border-[#DADCE0] dark:border-[#383838] rounded-sm text-xs">
                        <div>
                          <span className="font-bold text-[#202124] dark:text-white">{item.description}</span>
                          <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block font-mono">SKU: {item.sku}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#34A853]">
                            {item.quantity} x L. {item.unitPrice.toFixed(2)} = L. {(item.quantity * item.unitPrice).toFixed(2)}
                          </span>
                          <button type="button" onClick={() => handleRemoveItem(idx)} className="text-[#EA4335]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 text-right">
                      <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] uppercase font-bold mr-2">Total Facturado:</span>
                      <span className="text-sm font-bold text-[#202124] dark:text-white font-mono">
                        L. {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* INSTALLATION ORDER CHECKBOX */}
              <div className="bg-[#FEF2F2] dark:bg-[#321c1c] border border-[#DC2626]/20 p-4 rounded-sm space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createInstallationOrder}
                    onChange={(e) => setCreateInstallationOrder(e.target.checked)}
                    className="w-4 h-4 text-[#DC2626] rounded-xs"
                  />
                  <span className="text-xs font-bold text-[#DC2626] dark:text-[#EF4444] font-heading">
                    Vincular y crear Orden de Instalación para estos equipos
                  </span>
                </label>

                {createInstallationOrder && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-bold block mb-1">Título de la Instalación</label>
                      <input
                        type="text"
                        value={installationTitle}
                        onChange={(e) => setInstallationTitle(e.target.value)}
                        placeholder="ej: Montaje e instalación de cámaras de seguridad"
                        className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">Ubicación de Montaje</label>
                      <input
                        type="text"
                        value={installationLocation}
                        onChange={(e) => setInstallationLocation(e.target.value)}
                        placeholder="ej: Edificio A, Nave Industrial"
                        className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-xs text-[#202124] dark:text-white font-medium focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                  </div>
                )}
              </div>

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
                  className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition disabled:opacity-50 font-heading"
                >
                  {saving ? 'Procesando...' : 'Completar Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
