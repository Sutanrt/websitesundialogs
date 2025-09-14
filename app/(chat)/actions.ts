'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';
export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies(); // <- pakai await
  cookieStore.set('chat-model', model, {
    path: '/',
    sameSite: 'lax',
    // secure: true, // aktifkan kalau full HTTPS saja
    // maxAge: 60 * 60 * 24 * 30, // contoh: 30 hari
  });
}


export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    // kalau mau lebih tepat, bisa kirim hanya message.content
    prompt: JSON.stringify(message),
  });

  return title;
}

// Null-safe + no-DB friendly
export async function deleteTrailingMessages({ id }: { id: string }) {
  // getMessageById bisa mengembalikan null di no-DB mode
  const [message] = (await getMessageById({ id })) ?? [];
  if (!message) return { ok: true, skipped: true as const };

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    // timestamp: message.createdAt, // opsional; stub no-DB akan diabaikan
  });

  return { ok: true };
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
