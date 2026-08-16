import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Fetch all members of active company
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.activeCompany) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const members = await prisma.companyMember.findMany({
      where: { companyId: user.activeCompany.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener miembros' }, { status: 500 });
  }
}
