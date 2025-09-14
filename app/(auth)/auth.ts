export type UserType = 'free' | 'pro' | 'enterprise' | 'admin'|'guest';

type Session = { user: { id: string; type: UserType; name?: string; email?: string } } | null;

export async function auth(): Promise<Session> {
  if (process.env.DISABLE_AUTH === 'true') {
    return { user: { id: 'dev', type: 'free', name: 'Local User', email: 'dev@local' } };
  }
  return null; // (prod: ganti dengan NextAuth asli)
}

export async function signIn(): Promise<void> { return; }
export async function signOut(): Promise<void> { return; }
