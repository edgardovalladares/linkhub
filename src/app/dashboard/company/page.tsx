'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Building2, Save, KeyRound, ShieldCheck, Check, Users, UserCheck, ShieldAlert, Trash2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function CompanyPage() {
  const [company, setCompany] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('TECHNICIAN');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [originUrl, setOriginUrl] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const [meRes, membersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/companies/members'),
      ]);
      const meData = await meRes.json();
      const membersData = await membersRes.json();

      if (meData.authenticated && meData.user?.activeCompany) {
        const comp = meData.user.activeCompany;
        setCompany(comp);
        setCurrentUserRole(meData.user.activeRole || 'TECHNICIAN');
        setName(comp.name || '');
        setTaxId(comp.taxId || '');
        setPhone(comp.phone || '');
        setEmail(comp.email || '');
        setAddress(comp.address || '');
        setLogoUrl(comp.logoUrl || '');
      }

      if (Array.isArray(membersData)) {
        setMembers(membersData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'OWNER';

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Solo los administradores pueden modificar los datos de la empresa.');
      return;
    }
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/companies/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, taxId, phone, email, address, logoUrl }),
      });

      if (res.ok) {
        setSuccessMsg('Datos de la empresa actualizados correctamente');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchCompanyData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/companies/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchCompanyData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!isAdmin) return;
    if (!confirm(`¿Estás seguro de remover a ${memberName} de la empresa?`)) return;

    try {
      const res = await fetch(`/api/companies/members/${memberId}`, { method: 'DELETE' });
      if (res.ok) fetchCompanyData();
    } catch (e) {
      console.error(e);
    }
  };

  const qrInvitationUrl = `${originUrl || 'https://linkhub.edgardovalladares.com'}/login?code=${company?.inviteCode || 'LINK-SAFE1'}`;

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#0E0E10] text-[#202124] dark:text-[#F0F0F2] font-sans material-transition">
      <Header
        title="Perfil de Empresa & Equipo"
        subtitle="Configuración de membrete, marca, código QR de invitación e integrantes"
      />

      <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 w-full max-w-full mx-auto">
        
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando datos de la empresa...</p>
        ) : (
          <>
            {/* COMPANY DETAILS CARD */}
            <div className="bg-white dark:bg-[#161618] border border-[#E8EAED] dark:border-[#2B2B30] rounded-sm p-4 sm:p-8 shadow-material-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8EAED] dark:border-[#2B2B30]">
                <div>
                  <h3 className="text-lg font-bold text-[#202124] dark:text-white flex items-center gap-2 font-heading">
                    <Building2 className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
                    Información de la Empresa
                  </h3>
                  <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">
                    Estos datos aparecerán en el encabezado oficial de todos tus Informes PDF.
                  </p>
                </div>

                {company?.inviteCode && (
                  <div className="bg-[#FEF2F2] dark:bg-[#321c1c] border border-[#DC2626]/30 px-3.5 py-2 rounded-sm text-xs font-medium">
                    <span className="text-[#5F6368] dark:text-[#9AA0A6] block text-[10px] uppercase font-bold">Código de Invitación</span>
                    <span className="font-mono font-bold text-[#DC2626] dark:text-[#EF4444] text-sm">{company.inviteCode}</span>
                  </div>
                )}
              </div>

              {/* QR CODE INVITATION CARD WITH DYNAMIC ORIGIN URL */}
              {company?.inviteCode && (
                <div className="bg-[#F8F9FA] dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] p-4 rounded-sm flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white border border-gray-300 rounded-sm shrink-0 shadow-xs">
                    <QRCodeSVG
                      value={qrInvitationUrl}
                      size={130}
                      bgColor="#FFFFFF"
                      fgColor="#121212"
                      level="H"
                    />
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="font-bold text-sm text-[#202124] dark:text-white flex items-center justify-center sm:justify-start gap-1.5 font-heading">
                      <QrCode className="w-4 h-4 text-[#DC2626] dark:text-[#EF4444]" />
                      Código QR de Invitación de Equipo
                    </h4>
                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                      Cualquier colaborador puede escanear este código QR directamente para unirse a <strong>{company.name}</strong>. Si no tiene cuenta, se redirigirá automáticamente para registrarse con el código precompletado.
                    </p>
                    <p className="text-xs font-mono font-bold text-[#DC2626] dark:text-[#EF4444] break-all">
                      URL Directa: {qrInvitationUrl}
                    </p>
                  </div>
                </div>
              )}

              {!isAdmin && (
                <div className="p-3 bg-[#FEF7E0] dark:bg-[#332a15] border border-[#FBBC05]/40 rounded-sm text-xs text-[#B06000] dark:text-[#FBBC05] font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Modo Lectura: Tienes rol de Técnico. Solo los Administradores pueden actualizar los datos de la empresa.</span>
                </div>
              )}

              <form onSubmit={handleUpdateCompany} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      required
                      disabled={!isAdmin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ej: Eliteh Security"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] disabled:opacity-60 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">URL del Logo (Informes PDF)</label>
                    <input
                      type="url"
                      disabled={!isAdmin}
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/mi-logo.png"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] disabled:opacity-60 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">RTN / ID Fiscal</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="08011995123456"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] disabled:opacity-60 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Teléfono Corporativo</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+504 2233-4455"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] disabled:opacity-60 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      disabled={!isAdmin}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contacto@empresa.com"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] disabled:opacity-60 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Dirección Física</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Barrio El Centro, Calle Principal..."
                    className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] disabled:opacity-60 font-medium"
                  />
                </div>

                {successMsg && (
                  <div className="p-3 bg-[#E6F4EA] dark:bg-[#1b2e21] border border-[#34A853]/30 rounded-sm text-[#137333] dark:text-[#34A853] text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex justify-end pt-3 border-t border-[#E8EAED] dark:border-[#2B2B30]">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5 disabled:opacity-50 font-heading"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Guardando...' : 'Guardar Cambios de Empresa'}</span>
                    </button>
                  </div>
                )}

              </form>
            </div>

            {/* TEAM MEMBERS MANAGEMENT TABLE */}
            <div className="bg-white dark:bg-[#161618] border border-[#E8EAED] dark:border-[#2B2B30] rounded-sm p-4 sm:p-8 shadow-material-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8EAED] dark:border-[#2B2B30]">
                <div>
                  <h3 className="text-lg font-bold text-[#202124] dark:text-white flex items-center gap-2 font-heading">
                    <Users className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444]" />
                    Miembros del Equipo ({members.length})
                  </h3>
                  <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">
                    Colaboradores vinculados a la empresa y sus permisos de acceso.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#1E1E22] border-b border-[#E8EAED] dark:border-[#2B2B30] text-[11px] font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider font-heading">
                      <th className="py-3 px-4">Usuario / Colaborador</th>
                      <th className="py-3 px-4">Correo</th>
                      <th className="py-3 px-4">Rol Asignado</th>
                      {isAdmin && <th className="py-3 px-4 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAED] dark:divide-[#2B2B30] text-xs font-medium text-[#202124] dark:text-[#E8EAED]">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-[#F8F9FA] dark:hover:bg-[#1E1E22] material-transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs font-heading">
                              {m.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#202124] dark:text-white font-heading">{m.user?.name}</p>
                              {m.user?.phone && <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">{m.user.phone}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#5F6368] dark:text-[#9AA0A6] font-mono">
                          {m.user?.email}
                        </td>

                        <td className="py-3.5 px-4">
                          {isAdmin ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleChangeRole(m.id, e.target.value)}
                              className="bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-2.5 py-1 text-xs text-[#202124] dark:text-white font-bold focus:outline-none focus:border-[#DC2626]"
                            >
                              <option value="ADMIN">ADMINISTRADOR</option>
                              <option value="TECHNICIAN">TÉCNICO</option>
                            </select>
                          ) : (
                            <span className="font-bold px-2.5 py-1 rounded-sm bg-[#F8F9FA] dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] text-[11px]">
                              {m.role === 'ADMIN' || m.role === 'OWNER' ? 'ADMINISTRADOR' : 'TÉCNICO'}
                            </span>
                          )}
                        </td>

                        {isAdmin && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRemoveMember(m.id, m.user?.name)}
                              title="Remover colaborador"
                              className="p-1.5 rounded-sm bg-[#FCE8E6] dark:bg-[#321c1c] hover:bg-[#FAD2CF] text-[#EA4335] border border-[#EA4335]/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
