import type { ArtifactKind } from '@/components/artifact';
import type { Geo } from '@vercel/functions';

export const artifactsPrompt = ``;

export const regularPrompt =
  '';

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  selectedChatModel,
  requestHints,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  if (selectedChatModel === 'chat-model-reasoning') {
    return `${regularPrompt}\n\n${requestPrompt}`;
  } else {
    return `${regularPrompt}\n\n${requestPrompt}\n\n${artifactsPrompt}`;
  }
};

export const codePrompt = `

`;

export const sheetPrompt = `
`;

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
) =>
  type === 'text'
    ? `\

${currentContent}
`
    : type === 'code'
      ? `\

${currentContent}
`
      : type === 'sheet'
        ? `\

${currentContent}
`
        : '';
