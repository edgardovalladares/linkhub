import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClientPage from './DashboardClientPage';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.activeCompany?.id) {
    redirect('/');
  }

  const companyId = user.activeCompany.id;

  const [workOrdersCount, pendingOrdersCount, lowStockCount, clientsCount, reportsCount, recentOrders, recentReports] = await Promise.all([
    prisma.workOrder.count({ where: { companyId } }),
    prisma.workOrder.count({ where: { companyId, status: { in: ['PENDING', 'IN_PROGRESS', 'DIAGNOSED'] } } }),
    prisma.product.count({ where: { companyId, stockQuantity: { lte: 5 } } }),
    prisma.client.count({ where: { companyId } }),
    prisma.workReport.count({ where: { companyId } }),
    prisma.workOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: true, diagnostic: true },
    }),
    prisma.workReport.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ]);

  return (
    <DashboardClientPage
      user={user}
      workOrdersCount={workOrdersCount}
      pendingOrdersCount={pendingOrdersCount}
      lowStockCount={lowStockCount}
      clientsCount={clientsCount}
      reportsCount={reportsCount}
      recentOrders={recentOrders}
      recentReports={recentReports}
    />
  );
}
