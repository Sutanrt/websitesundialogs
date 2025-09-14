'use client';

import { signOut } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';

export function SignOutForm() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();        // ← tanpa argumen
        redirect('/');          // ← redirect manual
      }}
    >
      <button type="submit">Sign out</button>
    </form>
  );
}
