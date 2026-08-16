import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const sales = await prisma.sale.findMany({
    where: { companyId: user.activeCompany.id },
    orderBy: { createdAt: 'desc' },
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

  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const {
      clientId,
      paymentMethod,
      notes,
      items, // array of { productId, description, quantity, unitPrice }
      createInstallationOrder, // boolean
      installationTitle,
      installationLocation,
    } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Debe agregar al menos un producto a la venta' }, { status: 400 });
    }

    const companyId = user.activeCompany.id;
    const salesCount = await prisma.sale.count({ where: { companyId } });
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(salesCount + 1).padStart(3, '0')}`;

    let totalAmount = 0;
    const saleItemsData = [];

    for (const item of items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.unitPrice) || 0);
      const subtotal = qty * price;
      totalAmount += subtotal;

      saleItemsData.push({
        productId: item.productId || null,
        description: item.description || 'Producto Vendido',
        quantity: qty,
        unitPrice: price,
        subtotal,
      });

      // Deduct inventory stock if product ID exists
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: qty,
            },
          },
        }).catch(() => {});
      }
    }

    const sale = await prisma.sale.create({
      data: {
        companyId,
        clientId: clientId || null,
        createdById: user.id,
        invoiceNumber,
        totalAmount,
        paymentMethod: paymentMethod || 'CASH',
        paymentStatus: 'PAID',
        notes: notes?.trim() || null,
        items: {
          create: saleItemsData,
        },
      },
    });

    // Optionally create linked Installation Work Order
    let workOrder = null;
    if (createInstallationOrder && clientId) {
      const orderCount = await prisma.workOrder.count({ where: { companyId } });
      const orderNumber = `OT-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;

      workOrder = await prisma.workOrder.create({
        data: {
          companyId,
          clientId,
          createdById: user.id,
          orderNumber,
          title: installationTitle?.trim() || `Instalación de equipos (${invoiceNumber})`,
          serviceType: 'INSTALLATION',
          priority: 'MEDIUM',
          location: installationLocation?.trim() || null,
          notes: `Vinculado a Factura ${invoiceNumber}`,
          status: 'PENDING',
        },
      });

      // Update sale to point to work order
      await prisma.sale.update({
        where: { id: sale.id },
        data: { workOrderId: workOrder.id },
      });
    }

    return NextResponse.json({ success: true, sale, workOrder });
  } catch (error: any) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Error al registrar la venta' }, { status: 500 });
  }
}
