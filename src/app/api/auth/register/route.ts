import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';
import { generateInviteCode } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { name, email, password, companyName, inviteCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    let activeCompanyId: string | undefined = undefined;

    if (inviteCode && inviteCode.trim()) {
      // User joins company via invite code
      const company = await prisma.company.findUnique({
        where: { inviteCode: inviteCode.trim().toUpperCase() },
      });

      if (!company) {
        return NextResponse.json({ error: 'El código de invitación no existe' }, { status: 400 });
      }

      await prisma.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'TECHNICIAN',
        },
      });

      activeCompanyId = company.id;
    } else if (companyName && companyName.trim()) {
      // User creates new company
      const generatedCode = generateInviteCode('LINK');
      const company = await prisma.company.create({
        data: {
          name: companyName.trim(),
          inviteCode: generatedCode,
        },
      });

      await prisma.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'OWNER',
        },
      });

      activeCompanyId = company.id;
    }

    await createSession(user.id, activeCompanyId);

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error interno al registrar usuario' }, { status: 500 });
  }
}
