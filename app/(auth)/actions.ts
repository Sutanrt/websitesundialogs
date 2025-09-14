'use server';

import { z } from 'zod';
import { signIn } from './auth';

/** ===================== Validasi form ===================== */
const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

/** ===================== Helper aman untuk Auth ===================== */
/**
 * signInSafe:
 * - Jika DISABLE_AUTH / NEXT_PUBLIC_DISABLE_AUTH = true → langsung sukses (skip NextAuth)
 * - Jika auth aktif → panggil NextAuth signIn('credentials', {...})
 */
async function signInSafe(email: string, password: string) {
  if (
    process.env.DISABLE_AUTH === 'true' ||
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'
  ) {
    return; // Auth dimatikan → anggap sukses
  }

  // Cast agar kompatibel saat signIn dummy bertipe 0-arg
  const fn = signIn as unknown as (
    provider: string,
    options?: Record<string, any>
  ) => Promise<any>;

  return fn('credentials', { email, password, redirect: false });
}

/** ===================== DB-safe wrappers ===================== */
/**
 * Tidak impor statis '@/lib/db/queries' agar build aman tanpa Postgres.
 * Saat DISABLE_DB=true → kembalikan stub/null.
 * Saat DB aktif dan fungsi tersedia → panggil implementasi asli.
 */
type CreateUserArgs = { email: string; password: string };
type GetUserArgs = { email: string };

async function createUserSafe(args: CreateUserArgs) {
  if (process.env.DISABLE_DB === 'true') {
    return { id: 'stub-user', email: args.email };
  }
  const mod = (await import('@/lib/db/queries').catch(() => null)) as any;
  if (!mod?.createUser) return { id: 'stub-user', email: args.email };
  return mod.createUser({ email: args.email, password: args.password });
}

async function getUserSafe(args: GetUserArgs) {
  if (process.env.DISABLE_DB === 'true') {
    return null; // tanpa DB → selalu dianggap belum ada user
  }
  const mod = (await import('@/lib/db/queries').catch(() => null)) as any;
  if (!mod?.getUser) return null;
  return mod.getUser({ email: args.email });
}

/** ===================== LOGIN ===================== */
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    await signInSafe(validatedData.email, validatedData.password);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};

/** ===================== REGISTER ===================== */
export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    });

    const existing = await getUserSafe({ email: validatedData.email });
    if (existing) {
      return { status: 'user_exists' };
    }

    await createUserSafe({
      email: validatedData.email,
      password: validatedData.password,
    });

    await signInSafe(validatedData.email, validatedData.password);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};
