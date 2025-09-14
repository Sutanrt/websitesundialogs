// app/(chat)/api/history/route.ts
export const runtime = 'nodejs';

export async function GET(req: Request) {
  // Dev lokal: tidak pakai DB → kembalikan riwayat kosong
  if (process.env.DISABLE_DB === 'true') {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    return Response.json({ chats: [] as any[], limit });
  }

  // (opsional) produksi: taruh implementasi aslinya di sini
  return new Response('history disabled in dev', { status: 404 });
}
