import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode || !inviteCode.trim()) {
      return NextResponse.json({ error: 'Proporcione el código de invitación' }, { status: 400 });
    }

    const cleanCode = inviteCode.trim().toUpperCase();

    const company = await prisma.company.findUnique({
      where: { inviteCode: cleanCode },
    });

    if (!company) {
      return NextResponse.json({ error: 'Código de invitación inválido o no existe' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
    });

    if (existingMember) {
      // Switch active company
      await createSession(user.id, company.id);
      return NextResponse.json({ success: true, message: 'Ya eres miembro de esta empresa. Se ha seleccionado como activa.' });
    }

    // Add member
    await prisma.companyMember.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'TECHNICIAN',
      },
    });

    // Set active company
    await createSession(user.id, company.id);

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error('Error joining company:', error);
    return NextResponse.json({ error: 'Error al unirse a la empresa' }, { status: 500 });
  }
}
