import { NextResponse } from 'next/server';
import { logoutSession, getCurrentUser } from '@/lib/auth';

export async function POST() {
  await logoutSession();
  return NextResponse.json({ success: true });
}
