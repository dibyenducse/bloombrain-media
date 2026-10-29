import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
export const ADMIN_COOKIE = 'bb-admin';
const MAX_AGE = 7 * 86400;
function secret() { const s = process.env.SESSION_SECRET; if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set to at least 32 characters.'); return s; }
function sign(value: string) { return createHmac('sha256', secret()).update(value).digest('base64url'); }
function safeEqual(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
// Compare hashes so the check takes the same time whatever the input length.
export function checkPassword(input: string) { const expected = process.env.ADMIN_PASSWORD; if (!expected) return false; const h = (v: string) => createHmac('sha256', 'bb-admin-password').update(v).digest('hex'); return safeEqual(h(input), h(expected)); }
export function createSessionToken() { const expires = String(Date.now() + MAX_AGE * 1000); return `${expires}.${sign(expires)}`; }
export const sessionCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: MAX_AGE };
export async function isAdmin() {
 const token = (await cookies()).get(ADMIN_COOKIE)?.value;
 if (!token) return false;
 const [expires, sig] = token.split('.');
 if (!expires || !sig || Number(expires) < Date.now()) return false;
 try { return safeEqual(sig, sign(expires)); } catch { return false; }
}
export function sameOrigin(req: Request) { const origin=req.headers.get('origin'); const host=req.headers.get('x-forwarded-host')||req.headers.get('host'); return !!origin && !!host && new URL(origin).host===host; }
