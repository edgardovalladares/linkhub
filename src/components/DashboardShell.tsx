'use client';

import React from 'react';
import Sidebar from './Sidebar';
import { MobileMenuProvider } from '@/context/MobileMenuContext';

export default function DashboardShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  return (
    <MobileMenuProvider>
      <div className="flex min-h-[100dvh] bg-[#F8F9FA] dark:bg-[#0E0E10] text-[#202124] dark:text-[#F0F0F2] font-sans material-transition">
        <Sidebar user={user} />
        <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </MobileMenuProvider>
  );
}
