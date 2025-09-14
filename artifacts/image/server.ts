import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

// artifacts/image/server.ts
export async function generateArtifactImage(title: string) {
  // NO-IMAGE mode: balikin placeholder SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="100%" height="100%" fill="#eee"/>
    <text x="50%" y="50%" font-size="42" text-anchor="middle" fill="#333">${title}</text>
  </svg>`;
  const b64 = Buffer.from(svg).toString('base64');
  return { image: `data:image/svg+xml;base64,${b64}` };
}


// export async function generateArtifactImage(title: string) {
//   try {
//     const { image } = await experimental_generateImage({
//       model: myProvider.imageModel('small-model'),
//       prompt: title,
//       n: 1,
//     });
//     return { image };
//   } catch {
//     // Fallback placeholder SVG agar build & runtime tetap jalan
//     const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
//       <rect width="100%" height="100%" fill="#eee"/>
//       <text x="50%" y="50%" font-size="42" text-anchor="middle" fill="#333">${title}</text>
//     </svg>`;
//     const b64 = Buffer.from(svg).toString('base64');
//     return { image: `data:image/svg+xml;base64,${b64}` };
//   }
// }

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return draftContent;
  },
});
