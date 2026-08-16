'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, Tag } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CCTV');
  const [unit, setUnit] = useState('PZA');
  const [unitPrice, setUnitPrice] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minStock, setMinStock] = useState('3');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [productsRes, meRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/auth/me'),
      ]);
      const data = await productsRes.json();
      const meData = await meRes.json();

      if (Array.isArray(data)) setProducts(data);
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
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setSku('');
    setName('');
    setCategory('CCTV');
    setUnit('PZA');
    setUnitPrice('0');
    setStockQuantity('10');
    setMinStock('3');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setSku(product.sku || '');
    setName(product.name || '');
    setCategory(product.category || 'CCTV');
    setUnit(product.unit || 'PZA');
    setUnitPrice(product.unitPrice ? String(product.unitPrice) : '0');
    setStockQuantity(String(product.stockQuantity || 0));
    setMinStock(String(product.minStock || 3));
    setDescription(product.description || '');
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          name,
          category,
          unit,
          unitPrice: parseFloat(unitPrice) || 0,
          stockQuantity: parseInt(stockQuantity, 10) || 0,
          minStock: parseInt(minStock, 10) || 3,
          description,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar productos del inventario.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar este producto del inventario?')) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al eliminar producto');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title="Inventario y Productos"
        subtitle="Control de materiales de videovigilancia, cámaras, cableado y componentes"
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
              placeholder="Buscar producto por SKU, nombre o categoría..."
              className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {/* PRODUCTS TABLE */}
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando inventario...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-12 text-center space-y-3 shadow-material-sm">
            <Package className="w-10 h-10 text-[#5F6368] dark:text-[#9AA0A6] mx-auto" />
            <h4 className="text-[#202124] dark:text-white font-bold font-heading">No se encontraron productos</h4>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Registra los insumos y equipos que utilizas en tus instalaciones.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm overflow-hidden shadow-material-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] dark:bg-[#252526] border-b border-[#E8EAED] dark:border-[#2D2D2D] text-[11px] font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider font-heading">
                    <th className="py-3 px-4">SKU / Código</th>
                    <th className="py-3 px-4">Producto / Descripción</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Stock Actual</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EAED] dark:divide-[#2D2D2D] text-xs font-medium text-[#202124] dark:text-[#E8EAED]">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stockQuantity <= (p.minStock || 3);
                    return (
                      <tr key={p.id} className="hover:bg-[#F8F9FA] dark:hover:bg-[#252526] material-transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#DC2626] dark:text-[#EF4444]">
                          {p.sku || 'S/N'}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-sm text-[#202124] dark:text-white font-heading">{p.name}</p>
                          {p.description && <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] truncate max-w-xs">{p.description}</p>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-[#F8F9FA] dark:bg-[#252526] text-[#3C4043] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#383838] text-[11px] font-bold">
                            <Tag className="w-3 h-3 text-[#DC2626] dark:text-[#EF4444]" />
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isLowStock ? 'text-[#EA4335]' : 'text-[#202124] dark:text-white'}`}>
                              {p.stockQuantity} {p.unit}
                            </span>
                            {isLowStock && (
                              <span className="px-2 py-0.5 bg-[#FCE8E6] dark:bg-[#321c1c] text-[#EA4335] border border-[#EA4335]/30 rounded-sm text-[10px] font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Bajo Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              title="Editar producto"
                              className="p-1.5 rounded-sm bg-[#F8F9FA] dark:bg-[#252526] hover:bg-[#E8EAED] dark:hover:bg-[#383838] text-[#3C4043] dark:text-[#E8EAED] border border-[#E8EAED] dark:border-[#383838]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Eliminar producto (Solo Admin)"
                                className="p-1.5 rounded-sm bg-[#FCE8E6] dark:bg-[#321c1c] hover:bg-[#FAD2CF] text-[#EA4335] border border-[#EA4335]/30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 w-full max-w-lg space-y-4 shadow-material-lg text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <Package className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto al Inventario'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">SKU / Código</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="CAM-001"
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-mono focus:outline-none focus:border-[#DC2626]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  >
                    <option value="INSTALACION">Instalación y Mano de Obra</option>
                    <option value="CCTV">CCTV / Cámaras</option>
                    <option value="REDES">Redes / Cableado</option>
                    <option value="ENERGIA">Fuentes de Poder / Energía</option>
                    <option value="ALMACENAMIENTO">Discos Duros / Almacenamiento</option>
                    <option value="ACCESORIOS">Conectores y Accesorios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Nombre del Producto / Insumo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Cámara Bullet IP 1080p Intemperie"
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Unidad</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  >
                    <option value="PZA">PZA (Pieza)</option>
                    <option value="MTS">MTS (Metros)</option>
                    <option value="CAJA">CAJA</option>
                    <option value="KIT">KIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Descripción Técnica</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Especificaciones o compatibilidad del equipo..."
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm p-3 text-xs text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                />
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
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
