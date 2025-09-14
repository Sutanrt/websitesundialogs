import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';
import type { VisibilityType } from '@/components/visibility-selector';
import type { Session } from 'next-auth'; // ⬅️ tambah

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const session = await auth();
  if (!session) redirect('/api/auth/guest');

  // ⬇️ normalisasi biar ada expires
const sessionForChat: Session = {
  user: session.user,
  expires:
    (session as any).expires ??
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
};
  const chat = await getChatById({ id });
  if (!chat) notFound();

  if (chat.visibility === 'private') {
    if (!session.user || session.user.id !== chat.userId) notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = convertToUIMessages(messagesFromDb);

  const model = (await cookies()).get('chat-model')?.value ?? DEFAULT_CHAT_MODEL;

  const chatId: string = (chat.id ?? id) as string;
  const visibility: VisibilityType = (chat.visibility ?? 'private') as VisibilityType;

  return (
    <>
      <Chat
        id={chatId}
        initialMessages={uiMessages}
        initialChatModel={model}
        initialVisibilityType={visibility}
        isReadonly={session?.user?.id !== chat.userId}
        session={sessionForChat}   
        autoResume={true}
      />
      <DataStreamHandler />
    </>
  );
}
