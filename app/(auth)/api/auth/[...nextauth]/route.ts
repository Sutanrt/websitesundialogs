// app/(auth)/api/auth/[...nextauth]/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Di dev lokal: matikan NextAuth
export async function GET() {
  if (process.env.DISABLE_AUTH === 'true') {
    return new NextResponse('auth disabled', { status: 404 });
  }
  // (opsional) isi implementasi NextAuth asli di production
  return new NextResponse('not implemented', { status: 501 });
}

export const POST = GET;
