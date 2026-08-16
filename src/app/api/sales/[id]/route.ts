import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const sale = await prisma.sale.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true, email: true } },
      workOrder: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!sale || sale.companyId !== user.activeCompany.id) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
  }

  return NextResponse.json(sale);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const role = user.activeRole;
  if (role !== 'ADMIN' && role !== 'OWNER') {
    return NextResponse.json({ error: 'Solo los administradores pueden anular ventas' }, { status: 403 });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!sale || sale.companyId !== user.activeCompany.id) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }

    // Restore inventory stock for returned items
    for (const item of sale.items) {
      if (item.productId && item.quantity > 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        }).catch(() => {});
      }
    }

    await prisma.sale.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Error al anular la venta' }, { status: 500 });
  }
}
