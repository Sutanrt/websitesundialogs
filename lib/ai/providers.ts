// import {
//   customProvider,
//   extractReasoningMiddleware,
//   wrapLanguageModel,
// } from 'ai';
// import { xai } from '@ai-sdk/xai';
// import {
//   artifactModel,
//   chatModel,
//   reasoningModel,
//   titleModel,
// } from './models.test';
// import { isTestEnvironment } from '../constants';

// export const myProvider = isTestEnvironment
//   ? customProvider({
//       languageModels: {
//         'chat-model': chatModel,
//         'chat-model-reasoning': reasoningModel,
//         'title-model': titleModel,
//         'artifact-model': artifactModel,
//       },
//     })
//   : customProvider({
//       languageModels: {
//         'chat-model': xai('grok-2-vision-1212'),
//         'chat-model-reasoning': wrapLanguageModel({
//           model: xai('grok-3-mini-beta'),
//           middleware: extractReasoningMiddleware({ tagName: 'think' }),
//         }),
//         'title-model': xai('grok-2-1212'),
//         'artifact-model': xai('grok-2-1212'),
//       },
//       imageModels: {
//         'small-model': xai.imageModel('grok-2-image'),
//       },
//     });
// lib/ai/providers.ts
// lib/ai/providers.ts
// lib/ai/providers.ts
import { createOpenAI } from '@ai-sdk/openai';

const base =
  (process.env.OLLAMA_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:11434') +
  '/v1';

const openai = createOpenAI({
  baseURL: base,                            // -> http://127.0.0.1:11434/v1
  apiKey: process.env.OLLAMA_API_KEY || 'ollama', // Ollama ga butuh key, dummy aja
});

const modelName = process.env.OLLAMA_MODEL || 'qwen2:7b-instruct';

export const myProvider = {
  // PENTING: gunakan chat-completions
  languageModel: (_id: string) => openai.chat(modelName),
};

