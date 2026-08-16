'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Wrench, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useMobileMenu } from '@/context/MobileMenuContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu();

  return (
    <header className="h-auto md:h-16 bg-white dark:bg-[#161618] border-b border-[#E8EAED] dark:border-[#2B2B30] px-6 sm:px-10 py-3 md:py-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-[100] font-sans shadow-material-sm material-transition">
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={toggleMobileMenu}
            type="button"
            className="md:hidden p-2 rounded-sm bg-[#F8F9FA] dark:bg-[#1E1E22] text-[#3C4043] dark:text-[#E8EAED] border border-[#DADCE0] dark:border-[#2B2B30]"
            title="Abrir menú"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#DC2626]" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#202124] dark:text-white tracking-tight font-heading leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* MOBILE THEME TOGGLE */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
        {/* DESKTOP THEME TOGGLE */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        <Link
          href="/dashboard/reports/new"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-sm shadow-material-sm material-transition hover:-translate-y-0.5 shrink-0"
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Nuevo Informe PDF</span>
        </Link>

        <Link
          href="/dashboard/work-orders"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 bg-white dark:bg-[#1E1E22] hover:bg-[#F8F9FA] dark:hover:bg-[#2B2B30] text-[#3C4043] dark:text-[#E8EAED] text-xs font-bold rounded-sm border border-[#DADCE0] dark:border-[#2B2B30] material-transition shrink-0"
        >
          <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DC2626]" />
          <span>Nueva Orden</span>
        </Link>
      </div>
    </header>
  );
}
