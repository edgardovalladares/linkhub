import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { companyId } = await req.json();

    const isMember = user.companyMembers.some(m => m.companyId === companyId);
    if (!isMember) {
      return NextResponse.json({ error: 'No tienes acceso a esta empresa' }, { status: 403 });
    }

    await createSession(user.id, companyId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al cambiar de empresa' }, { status: 500 });
  }
}
