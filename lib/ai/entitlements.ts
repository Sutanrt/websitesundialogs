import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

// (opsional) profil dasar biar ga duplikatif
const BASE: Entitlements = {
  maxMessagesPerDay: 100,
  availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },
  free: BASE,
  pro: {
    maxMessagesPerDay: 500,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },
  enterprise: {
    maxMessagesPerDay: 5000,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },
  admin: {
    maxMessagesPerDay: 999_999,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },
};

// Helper supaya legacy "regular" tetap jalan → dipetakan ke "free"
export function getEntitlements(userType?: string): Entitlements {
  const normalized = userType === 'regular' ? 'free' : (userType ?? 'guest');
  return entitlementsByUserType[normalized as UserType];
}
