import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'linkhub_super_secret_jwt_key_2026_production_ready'
);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createSession(userId: string, activeCompanyId?: string) {
  const token = await new SignJWT({ userId, activeCompanyId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const cookieStore = cookies();
  cookieStore.set('linkhub_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return token;
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('linkhub_session')?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string; activeCompanyId?: string };
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      companyMembers: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!user) return null;

  // Determine active company
  let activeCompanyId = session.activeCompanyId;
  let activeMember = user.companyMembers.find(m => m.companyId === activeCompanyId);

  if (!activeMember && user.companyMembers.length > 0) {
    activeMember = user.companyMembers[0];
    activeCompanyId = activeMember.companyId;
  }

  return {
    ...user,
    activeCompany: activeMember?.company || null,
    activeRole: activeMember?.role || null,
  };
}

export async function logoutSession() {
  const cookieStore = cookies();
  cookieStore.delete('linkhub_session');
}
