import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const report = await prisma.workReport.findFirst({
    where: {
      id: params.id,
      companyId: user.activeCompany.id,
    },
    include: {
      company: true,
      materials: {
        include: { product: true },
      },
      createdBy: { select: { name: true, email: true } },
      workOrder: { select: { orderNumber: true, title: true } },
    },
  });

  if (!report) {
    return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { clientName, location, serviceType, problematicFound, workDone, finalResult, technicianName, materials } = await req.json();

    const report = await prisma.workReport.findFirst({
      where: { id: params.id, companyId: user.activeCompany.id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 });
    }

    await prisma.workReport.update({
      where: { id: params.id },
      data: {
        clientName: clientName?.trim() || report.clientName,
        location: location?.trim() || report.location,
        serviceType: serviceType?.trim() || report.serviceType,
        problematicFound: problematicFound?.trim() || report.problematicFound,
        workDone: workDone?.trim() || report.workDone,
        finalResult: finalResult?.trim() || report.finalResult,
        technicianName: technicianName?.trim() || report.technicianName,
      },
    });

    if (materials && Array.isArray(materials)) {
      await prisma.reportMaterial.deleteMany({ where: { reportId: params.id } });
      await prisma.reportMaterial.createMany({
        data: materials.map((m: any) => ({
          reportId: params.id,
          productId: m.productId || null,
          description: m.description.trim(),
          quantity: Number(m.quantity) || 1,
          unit: m.unit || 'PZA',
          unitPrice: Number(m.unitPrice) || 0.0,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar informe' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.activeRole !== 'ADMIN' && user.activeRole !== 'OWNER') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar informes PDF' }, { status: 403 });
  }

  try {
    await prisma.workReport.deleteMany({
      where: {
        id: params.id,
        companyId: user.activeCompany.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar informe' }, { status: 500 });
  }
}
