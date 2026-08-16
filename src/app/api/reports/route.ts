import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const reports = await prisma.workReport.findMany({
    where: { companyId: user.activeCompany.id },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, email: true } },
      materials: true,
      workOrder: { select: { orderNumber: true, title: true } },
    },
  });

  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { workOrderId, clientName, location, serviceType, problematicFound, workDone, finalResult, technicianName, materials } = await req.json();

    if (!clientName || !problematicFound || !workDone || !finalResult) {
      return NextResponse.json({ error: 'Faltan secciones requeridas en el informe' }, { status: 400 });
    }

    const count = await prisma.workReport.count({ where: { companyId: user.activeCompany.id } });
    const reportCode = `INF-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const report = await prisma.workReport.create({
      data: {
        companyId: user.activeCompany.id,
        workOrderId: workOrderId || null,
        createdById: user.id,
        reportCode,
        clientName: clientName.trim(),
        location: location?.trim() || 'N/A',
        serviceType: serviceType?.trim() || 'Mantenimiento y corrección',
        problematicFound: problematicFound.trim(),
        workDone: workDone.trim(),
        finalResult: finalResult.trim(),
        technicianName: technicianName?.trim() || user.name,
        status: 'COMPLETED',
      },
    });

    if (materials && Array.isArray(materials) && materials.length > 0) {
      await prisma.reportMaterial.createMany({
        data: materials.map((m: any) => ({
          reportId: report.id,
          productId: m.productId || null,
          description: m.description.trim(),
          quantity: Number(m.quantity) || 1,
          unit: m.unit || 'PZA',
          unitPrice: Number(m.unitPrice) || 0.0,
        })),
      });

      // Deduct stock if productId is present
      for (const m of materials) {
        if (m.productId) {
          await prisma.product.update({
            where: { id: m.productId },
            data: {
              stockQuantity: {
                decrement: Number(m.quantity) || 1,
              },
            },
          }).catch(() => {}); // Ignore if product doesn't exist
        }
      }
    }

    // Update work order status if linked
    if (workOrderId) {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { status: 'COMPLETED', completedDate: new Date() },
      }).catch(() => {});
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error creating work report:', error);
    return NextResponse.json({ error: 'Error al generar informe' }, { status: 500 });
  }
}
