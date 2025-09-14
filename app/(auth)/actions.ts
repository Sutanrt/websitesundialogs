'use server';

import { z } from 'zod';
import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

/** DB-safe wrappers: tidak impor statis ke '@/lib/db/queries' */
type CreateUserArgs = { email: string; password: string };
type GetUserArgs = { email: string };

async function createUserSafe(args: CreateUserArgs) {
  // Tanpa DB → stub berhasil
  if (process.env.DISABLE_DB === 'true') {
    return { id: 'stub-user', email: args.email };
  }
  const mod = await import('@/lib/db/queries').catch(() => null) as any;
  if (!mod?.createUser) return { id: 'stub-user', email: args.email };
  return mod.createUser({ email: args.email, password: args.password });
}

async function getUserSafe(args: GetUserArgs) {
  if (process.env.DISABLE_DB === 'true') {
    return null; // tanpa DB, anggap belum ada user
  }
  const mod = await import('@/lib/db/queries').catch(() => null) as any;
  if (!mod?.getUser) return null;
  return mod.getUser({ email: args.email });
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const existing = await getUserSafe({ email: validatedData.email });
    if (existing) {
      return { status: 'user_exists' };
    }

    await createUserSafe({
      email: validatedData.email,
      password: validatedData.password,
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};
