'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(state: { error: string }, formData: FormData) {
  const role = formData.get('role') as string;
  const password = formData.get('password') as string;

  let isValid = false;
  if (role === 'admin' && (password === 'admin123' || password === process.env.ADMIN_PASSWORD)) {
    isValid = true;
  } else if (role === 'seller' && password === 'vendedor123') {
    isValid = true;
  } else if (role === 'buyer' && password === 'cliente123') {
    isValid = true;
  }

  if (isValid) {
    const cookieStore = await cookies();
    cookieStore.set('sivm_auth_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    cookieStore.set('sivm_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    redirect(`/${role}`);
  } else {
    return { error: 'Credenciales incorrectas' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: 'sivm_auth_session', path: '/' });
  cookieStore.delete({ name: 'sivm_role', path: '/' });
  cookieStore.set('sivm_auth_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.set('sivm_role', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  redirect('/login');
}

export async function verifySession(allowedRoles?: string[]) {
  const cookieStore = await cookies();
  const session = cookieStore.get('sivm_auth_session')?.value;
  const role = cookieStore.get('sivm_role')?.value;

  if (!session || !role) {
    throw new Error("No autorizado: Falta sesión o rol.");
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new Error(`No autorizado: Rol '${role}' no tiene permisos.`);
  }

  return { session, role };
}
