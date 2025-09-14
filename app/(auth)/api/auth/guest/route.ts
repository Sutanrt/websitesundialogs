import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const redirectUrl = url.searchParams.get('redirectUrl') ?? '/';

    if (process.env.DISABLE_AUTH === 'true') {
      // PENTING: pakai return!
      return NextResponse.redirect(redirectUrl, 307);
    }

    // Mode prod (kalau DISABLE_AUTH !== 'true')
    return new NextResponse('Guest auth only available in prod setup', { status: 404 });
  } catch (err) {
    console.error('guest route error:', err);
    return new NextResponse('Bad Request', { status: 400 });
  }
}
