import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { title, serviceType, status, priority, location, notes, problemDescription, inspectionFindings } = await req.json();

    const workOrder = await prisma.workOrder.findFirst({
      where: { id: params.id, companyId: user.activeCompany.id },
    });

    if (!workOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    await prisma.workOrder.update({
      where: { id: params.id },
      data: {
        title: title?.trim() || workOrder.title,
        serviceType: serviceType || workOrder.serviceType,
        status: status || workOrder.status,
        priority: priority || workOrder.priority,
        location: location?.trim() || workOrder.location,
        notes: notes?.trim() || workOrder.notes,
        completedDate: status === 'COMPLETED' ? new Date() : workOrder.completedDate,
      },
    });

    if (problemDescription) {
      await prisma.inspectionDiagnostic.upsert({
        where: { workOrderId: params.id },
        update: {
          problemDescription: problemDescription.trim(),
          inspectionFindings: inspectionFindings?.trim() || null,
        },
        create: {
          workOrderId: params.id,
          inspectorId: user.id,
          problemDescription: problemDescription.trim(),
          inspectionFindings: inspectionFindings?.trim() || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.activeRole !== 'ADMIN' && user.activeRole !== 'OWNER') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar órdenes de trabajo' }, { status: 403 });
  }

  try {
    await prisma.workOrder.deleteMany({
      where: {
        id: params.id,
        companyId: user.activeCompany.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar orden' }, { status: 500 });
  }
}
