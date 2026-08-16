import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { companyId: user.activeCompany.id },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { sku, name, description, category, stockQuantity, minStockAlert, unitCost, salePrice, unit } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del producto/material es obligatorio' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        companyId: user.activeCompany.id,
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

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al registrar producto' }, { status: 500 });
  }
}
