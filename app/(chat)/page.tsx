import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth'; // ← tambah

export default async function Page() {
  const session = await auth();
  if (!session) redirect('/api/auth/guest');

  // Normalisasi: pastikan ada field `expires`
  const sessionForChat: Session = {
    user: session.user,
    expires:
      (session as any).expires ??
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // fallback 30 hari
  };

  const id = generateUUID();

  const model =
    (await cookies()).get('chat-model')?.value ?? DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={model}
        initialVisibilityType="private"
        isReadonly={false}
        session={sessionForChat}  // ← pakai session yang sudah dinormalisasi
        autoResume={false}
      />
      <DataStreamHandler />
    </>
  );
}
