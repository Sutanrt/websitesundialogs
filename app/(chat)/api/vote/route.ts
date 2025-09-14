export const runtime = 'nodejs';

// Kembalikan ARRAY, bukan object
export async function GET(req: Request) {
  if (process.env.DISABLE_DB === 'true') {
    // Bentuk minimal yang aman dipakai votes.find(...)
    return Response.json([]); // mis. [] atau [{ messageId:'...', vote:'up' }]
  }
  return new Response('vote disabled in dev', { status: 404 });
}

export async function POST(req: Request) {
  if (process.env.DISABLE_DB === 'true') {
    // Anggap sukses dan kembalikan array votes terkini (di dev: kosong saja)
    return Response.json([]);
  }
  return new Response('vote disabled in dev', { status: 404 });
}
