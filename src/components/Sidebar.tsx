'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  FileText,
  Building2,
  KeyRound,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Copy,
  Check,
  User,
  X,
  CheckCircle2,
  ShoppingBag,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMobileMenu } from '@/context/MobileMenuContext';

interface SidebarProps {
  user: any;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();

  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [originUrl, setOriginUrl] = useState('');

  const activeCompany = user?.activeCompany;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const handleCopyCode = () => {
    if (activeCompany?.inviteCode) {
      navigator.clipboard.writeText(activeCompany.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/companies/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al unirse');
      } else {
        setShowInviteModal(false);
        setInviteInput('');
        router.refresh();
      }
    } catch (e) {
      setErrorMsg('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Inventario / Productos', href: '/dashboard/products', icon: Package },
    { name: 'Ventas de Equipos', href: '/dashboard/sales', icon: ShoppingBag },
    { name: 'Órdenes de Trabajo', href: '/dashboard/work-orders', icon: Wrench },
    { name: 'Informes de Cierre', href: '/dashboard/reports', icon: FileText },
    { name: 'Empresa & Equipo', href: '/dashboard/company', icon: Building2 },
    { name: 'Mi Perfil', href: '/dashboard/profile', icon: User },
  ];

  const qrInvitationUrl = `${originUrl || 'https://linkhub.edgardovalladares.com'}/login?code=${activeCompany?.inviteCode || 'LINK-SAFE1'}`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#161618] text-[#202124] dark:text-[#E8EAED] font-sans">
      
      {/* LINKHUB LOGO AREA - CENTERED AND ALIGNED WITH HEADER */}
      <div className="h-16 border-b border-[#E8EAED] dark:border-[#2B2B30] px-6 flex items-center justify-center text-center shrink-0">
        <Link href="/dashboard" onClick={closeMobileMenu} className="flex items-center justify-center">
          <img
            src="https://i.ibb.co/dwNZT57W/linkhub.png"
            alt="LinkHub"
            className="h-8 sm:h-9 w-auto max-w-[160px] object-contain dark-logo-white transition-all duration-200"
          />
        </Link>
        <button
          onClick={closeMobileMenu}
          className="md:hidden absolute right-4 p-1.5 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#DC2626]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ACTIVE COMPANY BRANDING - LARGE LOGO AND CLEAN NO-LINE CONTAINER */}
      <div className="p-4 border-b border-[#E8EAED] dark:border-[#2B2B30] bg-white dark:bg-[#161618] flex flex-col items-center justify-center text-center space-y-3">
        <div className="flex items-center justify-center gap-2 w-full">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] font-heading">
            Empresa Activa
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#DC2626] text-white">
            {user?.activeRole || 'MIEMBRO'}
          </span>
        </div>

        {/* CENTERED PROMINENT LARGE COMPANY LOGO OR HEADING */}
        <div className="flex flex-col items-center justify-center space-y-2 w-full py-1">
          {activeCompany?.logoUrl ? (
            <img
              src={activeCompany.logoUrl}
              alt={activeCompany.name}
              className="h-16 sm:h-20 w-auto max-w-[200px] object-contain mx-auto transition-all duration-200"
            />
          ) : null}

          <div className="flex items-center justify-center gap-1.5 w-full">
            <h3 className="font-extrabold text-base text-[#202124] dark:text-white truncate font-heading tracking-tight text-center">
              {activeCompany?.name || 'LinkHub Soluciones'}
            </h3>
            <span title="Empresa Verificada">
              <CheckCircle2 className="w-4 h-4 text-[#1D9BF0] shrink-0" />
            </span>
          </div>
        </div>

        {activeCompany?.inviteCode && (
          <div className="pt-2 flex items-center justify-center gap-3 w-full text-xs">
            <div className="text-center">
              <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] font-medium block">Código Invitación</span>
              <span className="font-mono text-xs font-bold text-[#DC2626] dark:text-[#EF4444]">{activeCompany.inviteCode}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowQRModal(true)}
                title="Ver Código QR de Invitación"
                className="p-1.5 rounded-sm bg-white dark:bg-[#1E1E22] hover:bg-[#E8EAED] dark:hover:bg-[#2B2B30] text-[#3C4043] dark:text-[#E8EAED] border border-[#E8EAED] dark:border-[#2B2B30] material-transition"
              >
                <QrCode className="w-3.5 h-3.5 text-[#DC2626] dark:text-[#EF4444]" />
              </button>
              <button
                onClick={handleCopyCode}
                title="Copiar Código"
                className="p-1.5 rounded-sm bg-white dark:bg-[#1E1E22] hover:bg-[#E8EAED] dark:hover:bg-[#2B2B30] text-[#3C4043] dark:text-[#E8EAED] border border-[#E8EAED] dark:border-[#2B2B30] material-transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#34A853]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-sm sm:text-base material-transition ${
                isActive
                  ? 'bg-[#DC2626] text-white font-bold shadow-material-sm'
                  : 'text-[#3C4043] dark:text-[#E8EAED] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#1E1E22] font-normal'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-[#5F6368] dark:text-[#9AA0A6]'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER & CIRCULAR USER PROFILE AVATAR */}
      <div className="p-3 border-t border-[#E8EAED] dark:border-[#2B2B30] bg-white dark:bg-[#161618]">
        <button
          onClick={() => {
            setShowInviteModal(true);
            closeMobileMenu();
          }}
          className="w-full mb-2.5 flex items-center justify-center gap-2 py-2 px-3 bg-[#3C4043] dark:bg-[#2B2B30] hover:bg-[#202124] dark:hover:bg-[#383A42] text-white text-xs font-bold rounded-sm material-transition font-heading"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#FBBC05]" />
          Unirse con Código
        </button>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* CIRCULAR PROFILE AVATAR (rounded-full) */}
            <div className="w-9 h-9 rounded-full bg-[#DC2626] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs border border-white dark:border-[#2B2B30] font-heading">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#202124] dark:text-white truncate font-heading">{user?.name}</p>
              <p className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] truncate font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-1.5 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#E8EAED] dark:hover:bg-[#2B2B30] rounded-sm material-transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR WITH SLEEK RIGHT SHADOW (NO DOUBLE BORDER LINE) */}
      <aside className="hidden md:flex w-72 h-screen sticky top-0 shadow-[4px_0_16px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.4)] z-[110] shrink-0">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[250] flex">
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* JOIN COMPANY MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] border border-[#E8EAED] dark:border-[#2B2B30] rounded-sm p-6 w-full max-w-md space-y-4 shadow-2xl text-[#202124] dark:text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 font-heading">
              <KeyRound className="w-5 h-5 text-[#DC2626]" />
              Ingresar Código de Invitación
            </h3>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              Pide al administrador de la empresa su código (ej: LINK-SAFE1) para unirte a su organización.
            </p>

            <form onSubmit={handleJoinCompany} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Código de Invitación</label>
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                  placeholder="ej: LINK-SAFE1"
                  className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm px-3 py-2 text-sm text-[#202124] dark:text-white font-mono uppercase focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-[#FCE8E6] dark:bg-[#321c1c] border border-[#EA4335]/30 rounded-sm text-[#EA4335] text-xs flex items-center gap-2 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-[#F8F9FA] dark:bg-[#1E1E22] hover:bg-[#E8EAED] text-[#3C4043] dark:text-[#E8EAED] text-xs font-bold rounded-sm border border-[#DADCE0] dark:border-[#2B2B30]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition disabled:opacity-50 font-heading"
                >
                  {loading ? 'Uniéndose...' : 'Unirse a la Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE INVITATION MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] border border-[#E8EAED] dark:border-[#2B2B30] rounded-sm p-6 w-full max-w-sm space-y-4 text-center shadow-2xl text-[#202124] dark:text-white">
            <h3 className="text-base font-bold flex items-center justify-center gap-2 font-heading">
              <QrCode className="w-5 h-5 text-[#DC2626]" />
              Código QR de Invitación
            </h3>
            <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
              Escanea este código QR con cualquier teléfono móvil para unirte directamente a <strong>{activeCompany?.name}</strong>.
            </p>

            <div className="p-4 bg-white border border-gray-300 rounded-sm inline-block mx-auto shadow-sm">
              <QRCodeSVG
                value={qrInvitationUrl}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#121212"
                level="H"
              />
            </div>

            <div className="bg-[#F8F9FA] dark:bg-[#1E1E22] p-2.5 rounded-sm border border-[#E8EAED] dark:border-[#2B2B30]">
              <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block uppercase font-bold">Código Directo</span>
              <span className="font-mono text-sm font-extrabold text-[#DC2626] dark:text-[#EF4444]">
                {activeCompany?.inviteCode}
              </span>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm font-heading"
            >
              Cerrar QR
            </button>
          </div>
        </div>
      )}
    </>
  );
}
