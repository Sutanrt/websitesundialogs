import { tool, type UIMessageStreamWriter } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById } from '@/lib/db/queries';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';

interface UpdateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}
type AllowedKind = 'text' | 'code' | 'image' | 'sheet';

function toAllowedKind(k: any): AllowedKind {
  return k === 'text' || k === 'code' || k === 'image' || k === 'sheet' ? k : 'text';
}

function normalizeDocumentRow(row: any): {
  id: string;
  title: string;
  kind: AllowedKind;
  content: string | null;
  createdAt: Date;
  userId: string;
} {
  return {
    id: row?.id ?? row?.documentId ?? 'unknown-doc',
    title: row?.title ?? '',
    kind: toAllowedKind(row?.kind),
    content: row?.content ?? null,
    createdAt: row?.createdAt ? new Date(row.createdAt) : new Date(0),
    userId: row?.userId ?? 'no-db',
  };
}


interface UpdateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    inputSchema: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const dbDoc = await getDocumentById({ id });

      if (!dbDoc) {
        return { error: 'Document not found' };
      }

      // ⬅️ normalize dulu agar sesuai tipe yang diharapkan handler
      const document = normalizeDocumentRow(dbDoc);

      dataStream.write({ type: 'data-clear', data: null, transient: true });

      const documentHandler = documentHandlersByArtifactKind.find(
        (d) => d.kind === document.kind,
      );
      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream,
        session,
      });

      dataStream.write({ type: 'data-finish', data: null, transient: true });

      return {
        id: document.id,
        title: document.title,
        kind: document.kind,
        content: 'The document has been updated successfully.',
      };
    },
  });