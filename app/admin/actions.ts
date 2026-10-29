'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, checkPassword, createSessionToken, sessionCookieOptions } from '@/lib/admin';
export async function signIn(form: FormData) {
 const password = form.get('password');
 if (typeof password !== 'string' || !checkPassword(password)) { await new Promise(r => setTimeout(r, 800)); redirect('/admin?error=1'); }
 (await cookies()).set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions);
 redirect('/admin');
}
export async function signOut() { (await cookies()).delete(ADMIN_COOKIE); redirect('/admin'); }
