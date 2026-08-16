'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { User, Save, Check, Lock, Phone, Mail, Image as ImageIcon } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
          setAvatarUrl(data.user.avatarUrl || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          avatarUrl,
          password: newPassword.trim() ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Perfil actualizado correctamente');
        setNewPassword('');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Error al actualizar perfil');
      }
    } catch (e) {
      setErrorMsg('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-[#121212] text-[#202124] dark:text-[#E8EAED] font-sans material-transition">
      <Header
        title="Mi Perfil de Usuario"
        subtitle="Administra tus datos personales y credenciales de acceso"
      />

      <div className="p-4 sm:p-8 space-y-6 w-full max-w-full mx-auto">
        
        {loading ? (
          <p className="text-[#5F6368] dark:text-[#9AA0A6] text-sm py-12 text-center font-medium">Cargando perfil...</p>
        ) : (
          <div className="bg-white dark:bg-[#1E1E1E] border border-[#E8EAED] dark:border-[#2D2D2D] rounded-sm p-5 sm:p-8 shadow-material-sm space-y-6">
            
            {/* USER HEADER AVATAR CARD */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#E8EAED] dark:border-[#2D2D2D]">
              <div className="w-16 h-16 rounded-sm bg-[#DC2626] text-white flex items-center justify-center font-bold text-2xl shadow-material-sm overflow-hidden font-heading shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span>{name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#202124] dark:text-white font-heading">{name}</h3>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium font-mono">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#FEF2F2] dark:bg-[#321c1c] text-[#DC2626] dark:text-[#EF4444] border border-[#DC2626]/30">
                  {user?.activeRole || 'MIEMBRO'}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold block mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Teléfono Móvil</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+504 9999-8888"
                      className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">URL Avatar / Perfil</label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://ejemplo.com/avatar.jpg"
                      className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Cambiar Contraseña (opcional)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Escribe una nueva contraseña..."
                    className="w-full bg-white dark:bg-[#252526] border border-[#DADCE0] dark:border-[#383838] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
              </div>

              {successMsg && (
                <div className="p-3 bg-[#E6F4EA] dark:bg-[#1b2e21] border border-[#34A853]/30 rounded-sm text-[#137333] dark:text-[#34A853] text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-[#FCE8E6] dark:bg-[#321c1c] border border-[#EA4335]/30 rounded-sm text-[#EA4335] text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-[#E8EAED] dark:border-[#2D2D2D]">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Perfil'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
