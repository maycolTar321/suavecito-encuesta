'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const password = formData.get('password');
  // Simple password check
  if (password === 'admin2026') {
    (await cookies()).set('suavecito_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    redirect('/admin');
  }
  return { error: 'Contraseña incorrecta' };
}

export async function logoutAction() {
  (await cookies()).delete('suavecito_auth');
  redirect('/admin/login');
}
