import { BrandLogo } from '@/components/portfolio';
import {isAdmin} from '@/lib/admin';
import {getChatGPTUser,chatGPTSignInPath,chatGPTSignOutPath} from '@/app/chatgpt-auth';
import Dashboard from '@/components/dashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Studio Dashboard — BloomBrain Media',robots:{index:false,follow:false}};
export default async function Admin(){const user=await getChatGPTUser();if(!user)return <main className="login"><a className="brand" href="/"><BrandLogo/></a><p className="eyebrow">PRIVATE STUDIO ACCESS</p><h1>Your studio.<br/><em>In focus.</em></h1><p>Sign in with the ChatGPT account associated with your authorized admin email.</p><a target="_top" className="button" href={chatGPTSignInPath('/admin')}>Sign in to dashboard ↗</a><small>Portfolio visitors do not need an account.</small></main>;if(!await isAdmin())return <main className="login"><h1>Admin access only.</h1><p>This account is not authorized to view visitor analytics or project inquiries.</p><a href={chatGPTSignOutPath('/admin')} target="_top" className="button">Sign out and switch account</a><a href="/">Back to portfolio</a></main>;return <Dashboard/>}
