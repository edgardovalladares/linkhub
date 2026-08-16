'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Users, Plus, Search, Building2, Phone, MapPin, Edit, Trash2 } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [taxId, setTaxId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const [clientsRes, meRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/auth/me'),
      ]);
      const data = await clientsRes.json();
      const meData = await meRes.json();

      if (Array.isArray(data)) setClients(data);
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
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setTaxId('');
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    setName(client.name || '');
    setContactPerson(client.contactPerson || '');
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setAddress(client.address || '');
    setCity(client.city || '');
    setTaxId(client.taxId || '');
    setShowModal(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactPerson, phone, email, address, city, taxId }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar clientes.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar este cliente? Se eliminarán sus registros.')) return;

    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchClients();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al eliminar cliente');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title="Gestión de Clientes"
        subtitle="Directorio de empresas y clientes particulares"
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
              placeholder="Buscar cliente por nombre o ciudad..."
              className="w-full bg-white dark:bg-[#1E1E1E] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        {/* CLIENTS GRID */}
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando clientes...</p>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-12 text-center space-y-3 shadow-material-sm">
            <Users className="w-10 h-10 text-[#5F6368] dark:text-[#9AA0A6] mx-auto" />
            <h4 className="text-[#202124] dark:text-white font-bold font-heading">No se encontraron clientes</h4>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Registra a tus clientes corporativos o residenciales.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-5 space-y-4 shadow-material-sm material-transition hover:border-[#DC2626]/40 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-[#FEF2F2] dark:bg-[#321c1c] text-[#DC2626] dark:text-[#EF4444] border border-[#DC2626]/30 flex items-center justify-center font-bold text-base font-heading">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#DC2626] dark:text-[#EF4444]">{client.code}</span>
                      <h3 className="font-bold text-base text-[#202124] dark:text-white leading-snug font-heading">{client.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      title="Editar cliente"
                      className="p-1.5 rounded-sm bg-[#F8F9FA] dark:bg-[#252526] hover:bg-[#E8EAED] dark:hover:bg-[#383838] text-[#3C4043] dark:text-[#E8EAED] border border-[#E8EAED] dark:border-[#383838]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        title="Eliminar cliente (Solo Admin)"
                        className="p-1.5 rounded-sm bg-[#FCE8E6] dark:bg-[#321c1c] hover:bg-[#FAD2CF] text-[#EA4335] border border-[#EA4335]/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-[#3C4043] dark:text-[#E8EAED] pt-2 border-t border-[#E8EAED] dark:border-[#2D2D2D] font-medium">
                  {client.contactPerson && (
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#EF4444]" />
                      <span>Contacto: <strong className="text-[#202124] dark:text-white">{client.contactPerson}</strong></span>
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
                      <Phone className="w-3.5 h-3.5 text-[#5F6368] dark:text-[#9AA0A6]" />
                      <span>{client.phone}</span>
                    </p>
                  )}
                  {client.city && (
                    <p className="flex items-center gap-2 text-[#5F6368] dark:text-[#9AA0A6]">
                      <MapPin className="w-3.5 h-3.5 text-[#5F6368] dark:text-[#9AA0A6]" />
                      <span>{client.city} {client.address ? `- ${client.address}` : ''}</span>
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#E8EAED] dark:border-[#2D2D2D] text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-bold">
                  <span>{client._count?.workOrders || 0} órdenes registradas</span>
                  <span>{client.taxId ? `RTN: ${client.taxId}` : 'Sin RTN'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE / EDIT CLIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-6 w-full max-w-lg space-y-4 shadow-material-lg text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <Building2 className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
              {editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h3>

            <form onSubmit={handleSaveClient} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Nombre del Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Nombre del Cliente o Empresa"
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="ej: Nombre de Contacto"
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+504 9999-8888"
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Ciudad / Ubicación</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="ej: Ciudad de residencia o planta"
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">RTN / ID Fiscal</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="08011990123456"
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Dirección Detallada</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Dirección física del cliente"
                  className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
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
                  {saving ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
