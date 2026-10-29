import { BrandLogo } from '@/components/portfolio';
import {isAdmin} from '@/lib/admin';
import Dashboard from '@/components/dashboard';
import {signIn} from './actions';
export const dynamic='force-dynamic';
export const metadata={title:'Studio Dashboard — BloomBrain Media',robots:{index:false,follow:false}};
export default async function Admin({searchParams}:{searchParams:Promise<{error?:string}>}){if(await isAdmin())return <Dashboard/>;const {error}=await searchParams;return <main className="login"><a className="brand" href="/"><BrandLogo/></a><p className="eyebrow">PRIVATE STUDIO ACCESS</p><h1>Your studio.<br/><em>In focus.</em></h1><p>Enter the admin password to view visitor analytics and project inquiries.</p><form action={signIn} className="login-form"><label className="sr-only" htmlFor="password">Admin password</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Admin password" required/><button className="button" type="submit">Sign in to dashboard ↗</button></form>{error&&<p role="alert" className="error">That password is not correct.</p>}<small>Portfolio visitors do not need an account.</small></main>}
