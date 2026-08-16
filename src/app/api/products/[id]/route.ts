import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { sku, name, description, category, stockQuantity, minStockAlert, unitCost, salePrice, unit } = await req.json();

    const product = await prisma.product.updateMany({
      where: {
        id: params.id,
        companyId: user.activeCompany.id,
      },
      data: {
        sku: sku?.trim() || null,
        name: name.trim(),
        description: description?.trim() || null,
        category: category || 'GENERAL',
        stockQuantity: Number(stockQuantity) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        unitCost: Number(unitCost) || 0.0,
        salePrice: Number(salePrice) || 0.0,
        unit: unit || 'PZA',
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.activeRole !== 'ADMIN' && user.activeRole !== 'OWNER') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar productos del inventario' }, { status: 403 });
  }

  try {
    await prisma.product.deleteMany({
      where: {
        id: params.id,
        companyId: user.activeCompany.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
