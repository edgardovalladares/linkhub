import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      activeCompany: user.activeCompany,
      activeRole: user.activeRole,
      companies: user.companyMembers.map(m => ({
        id: m.company.id,
        name: m.company.name,
        role: m.role,
        inviteCode: m.company.inviteCode,
      })),
    },
  });
}
