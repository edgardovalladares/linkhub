import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const workOrders = await prisma.workOrder.findMany({
    where: { companyId: user.activeCompany.id },
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true, email: true } },
      diagnostic: true,
      workReports: true,
      sales: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(workOrders);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const {
      clientId,
      title,
      serviceType,
      priority,
      scheduledDate,
      location,
      notes,
      problemDescription,
      inspectionFindings,
      recommendations,
      selectedProducts, // array of { productId, quantity, unitPrice }
    } = await req.json();

    if (!clientId || !title || !serviceType) {
      return NextResponse.json({ error: 'Cliente, título y tipo de servicio son requeridos' }, { status: 400 });
    }

    const count = await prisma.workOrder.count({ where: { companyId: user.activeCompany.id } });
    const orderNumber = `OT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        companyId: user.activeCompany.id,
        clientId,
        createdById: user.id,
        orderNumber,
        title: title.trim(),
        serviceType,
        priority: priority || 'MEDIUM',
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        location: location?.trim() || null,
        notes: notes?.trim() || null,
        status: problemDescription ? 'DIAGNOSED' : 'PENDING',
      },
    });

    if (problemDescription && problemDescription.trim()) {
      await prisma.inspectionDiagnostic.create({
        data: {
          workOrderId: workOrder.id,
          inspectorId: user.id,
          problemDescription: problemDescription.trim(),
          inspectionFindings: inspectionFindings?.trim() || null,
          recommendations: recommendations?.trim() || null,
        },
      });
    }

    // IF SERVICE IS INSTALLATION AND SALE WITH LINKED PRODUCTS
    if (serviceType === 'INSTALLATION_SALE' && Array.isArray(selectedProducts) && selectedProducts.length > 0) {
      const salesCount = await prisma.sale.count({ where: { companyId: user.activeCompany.id } });
      const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(salesCount + 1).padStart(3, '0')}`;

      let totalAmount = 0;
      const saleItemsData = [];

      for (const item of selectedProducts) {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        const subtotal = qty * price;
        totalAmount += subtotal;

        saleItemsData.push({
          productId: item.productId || null,
          description: item.description || 'Producto/Equipo Instalado',
          quantity: qty,
          unitPrice: price,
          subtotal,
        });

        // Deduct inventory stock if productId is specified
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

      await prisma.sale.create({
        data: {
          companyId: user.activeCompany.id,
          clientId,
          workOrderId: workOrder.id,
          createdById: user.id,
          invoiceNumber,
          totalAmount,
          notes: notes?.trim() || null,
          items: {
            create: saleItemsData,
          },
        },
      });
    }

    return NextResponse.json(workOrder);
  } catch (error: any) {
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: 'Error al crear orden de trabajo' }, { status: 500 });
  }
}
