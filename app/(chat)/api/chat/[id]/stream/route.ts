// app/api/chat/[id]/stream/route.ts
import { getStreamContext } from '../../route';

export async function GET() {
  const streamContext = getStreamContext();
  // Tanpa Redis/stream id dari DB, tidak ada yang bisa di-resume -> 204
  if (!streamContext) return new Response(null, { status: 204 });
  return new Response(null, { status: 204 });
}
