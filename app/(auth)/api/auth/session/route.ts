// app/(auth)/api/auth/session/route.ts
export const runtime = 'nodejs';

export async function GET() {
  // Dev lokal: pulangkan session palsu (guest)
  if (
    process.env.DISABLE_AUTH === 'true' ||
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  ) {
    return Response.json({
      user: {
        id: 'dev',
        name: 'Local User',
        email: 'dev@local',
        type: 'free',
      },
      expires: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
  }

  // Production / auth aktif: endpoint ini tidak dipakai
  return new Response('auth session disabled in dev', { status: 404 });
}
