import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { companyId: user.activeCompany.id },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { workOrders: true, sales: true },
      },
    },
  });

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { name, contactPerson, phone, email, address, city, taxId, notes } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 });
    }

    const count = await prisma.client.count({ where: { companyId: user.activeCompany.id } });
    const code = `CLI-${String(count + 1).padStart(3, '0')}`;

    const client = await prisma.client.create({
      data: {
        companyId: user.activeCompany.id,
        code,
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

    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al registrar cliente' }, { status: 500 });
  }
}
