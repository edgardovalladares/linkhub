'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, KeyRound, User, Lock, Mail, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerType, setRegisterType] = useState<'create' | 'join'>('create');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoJoiningMsg, setAutoJoiningMsg] = useState('');

  useEffect(() => {
    // If URL has code parameter (e.g. ?code=LINK-SAFE1)
    if (codeParam && codeParam.trim()) {
      const codeUpper = codeParam.trim().toUpperCase();
      setInviteCode(codeUpper);
      setMode('register');
      setRegisterType('join');

      // Check if user is already logged in
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setAutoJoiningMsg(`Vinculando tu cuenta a la empresa con código ${codeUpper}...`);
            // Automatically join company for logged-in user
            fetch('/api/companies/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ inviteCode: codeUpper }),
            }).then(() => {
              router.push('/dashboard');
              router.refresh();
            });
          }
        })
        .catch(() => {});
    }
  }, [codeParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email, password }
          : {
              name,
              email,
              password,
              companyName: registerType === 'create' ? companyName : undefined,
              inviteCode: registerType === 'join' ? inviteCode : undefined,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Ocurrió un error');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8F9FA] dark:bg-[#0E0E10] flex flex-col items-center justify-center p-4 font-sans text-[#202124] dark:text-[#F0F0F2] relative material-transition">
      
      {/* TOP RIGHT THEME TOGGLE FOR LOGIN */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* CENTERED FORM CARD WITH LOGO IMAGE */}
      <div className="w-full max-w-md bg-white dark:bg-[#161618] border border-[#E8EAED] dark:border-[#2B2B30] rounded-sm p-6 sm:p-8 shadow-material-lg space-y-6">
        
        {/* LOGO IMAGE - FORCED WHITE IN DARK MODE */}
        <div className="flex justify-center mb-2">
          <img
            src="https://i.ibb.co/dwNZT57W/linkhub.png"
            alt="LinkHub"
            className="h-10 sm:h-12 w-auto object-contain dark-logo-white transition-all duration-200"
          />
        </div>

        {autoJoiningMsg ? (
          <div className="p-4 bg-[#E6F4EA] dark:bg-[#1b2e21] border border-[#34A853]/30 rounded-sm text-[#137333] dark:text-[#34A853] text-xs font-bold flex items-center justify-center gap-2 text-center">
            <CheckCircle2 className="w-5 h-5 shrink-0 animate-pulse" />
            <span>{autoJoiningMsg}</span>
          </div>
        ) : null}

        {/* TAB SWITCHER */}
        <div className="flex bg-[#F8F9FA] dark:bg-[#1E1E22] p-1 rounded-sm border border-[#DADCE0] dark:border-[#2B2B30]">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-sm material-transition font-heading ${
              mode === 'login'
                ? 'bg-[#DC2626] text-white shadow-material-sm'
                : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-sm material-transition font-heading ${
              mode === 'register'
                ? 'bg-[#DC2626] text-white shadow-material-sm'
                : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold block mb-1">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej: Carlos Mendoza"
                    className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                  />
                </div>
              </div>

              {/* REGISTER TYPE */}
              <div>
                <span className="text-xs font-bold block mb-1">¿Qué deseas hacer?</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterType('create')}
                    className={`p-2.5 rounded-sm border text-left text-xs font-bold flex items-center gap-2 material-transition ${
                      registerType === 'create'
                        ? 'border-[#DC2626] bg-[#FEF2F2] dark:bg-[#321c1c] text-[#DC2626] dark:text-[#EF4444]'
                        : 'border-[#DADCE0] dark:border-[#2B2B30] bg-[#F8F9FA] dark:bg-[#1E1E22] text-[#5F6368] dark:text-[#9AA0A6]'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#DC2626]" />
                    <span>Crear Empresa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterType('join')}
                    className={`p-2.5 rounded-sm border text-left text-xs font-bold flex items-center gap-2 material-transition ${
                      registerType === 'join'
                        ? 'border-[#DC2626] bg-[#FEF2F2] dark:bg-[#321c1c] text-[#DC2626] dark:text-[#EF4444]'
                        : 'border-[#DADCE0] dark:border-[#2B2B30] bg-[#F8F9FA] dark:bg-[#1E1E22] text-[#5F6368] dark:text-[#9AA0A6]'
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-[#DC2626]" />
                    <span>Tengo Código</span>
                  </button>
                </div>
              </div>

              {registerType === 'create' ? (
                <div>
                  <label className="text-xs font-bold block mb-1">Nombre de la Empresa</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ej: LinkHub Soluciones"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold block mb-1">Código de Invitación</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="ej: LINK-SAFE1"
                      className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white uppercase font-mono tracking-wider focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-bold block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5F6368] dark:text-[#9AA0A6] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white dark:bg-[#1E1E22] border border-[#DADCE0] dark:border-[#2B2B30] rounded-sm pl-9 pr-3 py-2 text-sm text-[#202124] dark:text-white focus:outline-none focus:border-[#DC2626] font-medium"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FCE8E6] dark:bg-[#321c1c] border border-[#EA4335]/30 rounded-sm text-[#EA4335] text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm rounded-sm shadow-material-sm flex items-center justify-center gap-2 material-transition hover:-translate-y-0.5 disabled:opacity-50 font-heading"
          >
            {loading ? (
              'Procesando...'
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar a LinkHub' : 'Completar Registro'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0E0E10]" />}>
      <AuthContent />
    </Suspense>
  );
}
