import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { name, contactPerson, phone, email, address, city, taxId, notes } = await req.json();

    const client = await prisma.client.updateMany({
      where: {
        id: params.id,
        companyId: user.activeCompany.id,
      },
      data: {
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        taxId: taxId?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (user.activeRole !== 'ADMIN' && user.activeRole !== 'OWNER') {
    return NextResponse.json({ error: 'Solo administradores pueden eliminar clientes' }, { status: 403 });
  }

  try {
    await prisma.client.deleteMany({
      where: {
        id: params.id,
        companyId: user.activeCompany.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 });
  }
}
