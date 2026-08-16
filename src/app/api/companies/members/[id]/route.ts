import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT: Update member role (ADMIN / TECHNICIAN)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Check if current user is ADMIN in active company
  if (user.activeRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo los administradores pueden cambiar roles' }, { status: 403 });
  }

  try {
    const { role } = await req.json();
    if (!['ADMIN', 'TECHNICIAN'].includes(role)) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    const member = await prisma.companyMember.findUnique({
      where: { id: params.id },
    });

    if (!member || member.companyId !== user.activeCompany.id) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 });
    }

    // Prevent admin from demoting themselves if they are sole admin
    if (member.userId === user.id && role !== 'ADMIN') {
      const adminCount = await prisma.companyMember.count({
        where: { companyId: user.activeCompany.id, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Debe haber al menos un Administrador en la empresa' }, { status: 400 });
      }
    }

    const updated = await prisma.companyMember.update({
      where: { id: params.id },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar rol' }, { status: 500 });
  }
}

// DELETE: Remove member from active company
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.activeRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo los administradores pueden eliminar miembros' }, { status: 403 });
  }

  try {
    const member = await prisma.companyMember.findUnique({
      where: { id: params.id },
    });

    if (!member || member.companyId !== user.activeCompany.id) {
      return NextResponse.json({ error: 'Miembro no encontrado' }, { status: 404 });
    }

    // Cannot delete self
    if (member.userId === user.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo de la empresa' }, { status: 400 });
    }

    await prisma.companyMember.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar miembro' }, { status: 500 });
  }
}
