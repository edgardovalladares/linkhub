import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Check admin/owner permissions
  if (user.activeRole !== 'OWNER' && user.activeRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores o propietarios pueden actualizar la empresa' }, { status: 403 });
  }

  try {
    const { name, taxId, phone, email, address, logoUrl } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre de la empresa es requerido' }, { status: 400 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.activeCompany.id },
      data: {
        name: name.trim(),
        taxId: taxId?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, company: updatedCompany });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar empresa' }, { status: 500 });
  }
}
