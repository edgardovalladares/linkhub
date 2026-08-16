import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { name, phone, avatarUrl, password } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    let passwordHash = user.passwordHash;

    if (password && password.trim()) {
      passwordHash = await hashPassword(password.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}
