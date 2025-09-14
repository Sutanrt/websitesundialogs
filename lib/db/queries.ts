// lib/db/queries.ts — NO-DB MODE (tanpa database)
// Semua fungsi dibuat no-op agar build dan runtime tidak error.

// ---- Minimal types agar import dari ./schema tidak diperlukan ----
export type VisibilityType = 'private' | 'public';
export type ArtifactKind = 'text' | 'code' | 'image' | 'other';

export type User = { id: string; email: string; password?: string | null };
export type Chat = { id: string; userId: string; title?: string; visibility?: VisibilityType; createdAt?: Date };
export type DBMessage = { id: string; chatId: string; role?: 'user' | 'assistant' | 'system'; content?: string; createdAt?: Date };
export type Suggestion = { id: string; documentId: string; documentCreatedAt?: Date; content?: string };
export type DocumentRow = { id: string; title: string; kind: ArtifactKind; content: string; userId: string; createdAt?: Date };

// Flag runtime (tetap ada kalau nanti kamu mau aktifkan DB)
const DB_OFF = process.env.DISABLE_DB === 'true' || !process.env.POSTGRES_URL;

// -------------- Users --------------
export async function getUser(_email: string): Promise<User[]> {
  return []; // tidak ada user
}
export async function createUser(_email: string, _password: string) {
  return { inserted: 0 }; // no-op
}
export async function createGuestUser() {
  return [{ id: `guest-${Date.now()}`, email: `guest-${Date.now()}` }];
}

// -------------- Chats --------------
export async function saveChat(_args: { id: string; userId: string; title: string; visibility: VisibilityType }) {
  return { inserted: 0 };
}
export async function deleteChatById(_args: { id: string }) {
  return { deleted: true };
}
export async function getChatsByUserId(_args: { id: string; limit: number; startingAfter: string | null; endingBefore: string | null }) {
  return { chats: [] as Chat[], hasMore: false };
}
export async function getChatById(_args: { id: string }): Promise<Chat | null> {
  return null;
}
export async function updateChatVisiblityById(args: { chatId: string; visibility: VisibilityType }) {
  return { id: args.chatId, visibility: args.visibility };
}

// -------------- Messages --------------
export async function saveMessages(_args: { messages: DBMessage[] }) {
  return { inserted: 0 };
}
export async function getMessagesByChatId(_args: { id: string }): Promise<DBMessage[]> {
  return [];
}
export async function getMessageById(_args: { id: string }): Promise<DBMessage[] | null> {
  // penting: kembalikan null supaya call site bisa null-safe
  return null;
}
export async function deleteMessagesByChatIdAfterTimestamp(_args: { chatId: string; timestamp?: Date; after?: Date }) {
  // terima timestamp/after apa pun, lakukan no-op
  return { deleted: 0 };
}
export async function getMessageCountByUserId(_args: { id: string; differenceInHours: number }) {
  return 0;
}

// -------------- Votes --------------
export async function voteMessage(_args: { chatId: string; messageId: string; type: 'up' | 'down' }) {
  return { upserted: true };
}
export async function getVotesByChatId(_args: { id: string }) {
  return [];
}

// -------------- Documents / Suggestions --------------
export async function saveDocument(_args: { id: string; title: string; kind: ArtifactKind; content: string; userId: string }) {
  return [{ id: _args.id }]; // mirip .returning()
}
export async function getDocumentsById(_args: { id: string }) {
  return [] as DocumentRow[];
}
export async function getDocumentById(_args: { id: string }): Promise<DocumentRow | null> {
  return null;
}
export async function deleteDocumentsByIdAfterTimestamp(_args: { id: string; timestamp: Date }) {
  return { deleted: 0 };
}
export async function saveSuggestions(_args: { suggestions: Suggestion[] }) {
  return { inserted: 0 };
}
export async function getSuggestionsByDocumentId(_args: { documentId: string }) {
  return [] as Suggestion[];
}

// -------------- Streams --------------
export async function createStreamId(_args: { streamId: string; chatId: string }) {
  return;
}
export async function getStreamIdsByChatId(_args: { chatId: string }) {
  return [] as string[];
}

// ---- Helper ekspor flag (opsional dipakai di UI/diagnostik) ----
export const __NO_DB__ = DB_OFF;
