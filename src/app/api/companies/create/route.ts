import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, createSession } from '@/lib/auth';
import { generateInviteCode } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, taxId, phone, email, address } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre de la empresa es requerido' }, { status: 400 });
    }

    const inviteCode = generateInviteCode('LINK');

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        taxId: taxId?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        inviteCode,
      },
    });

    await prisma.companyMember.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'OWNER',
      },
    });

    await createSession(user.id, company.id);

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Error al crear la empresa' }, { status: 500 });
  }
}
