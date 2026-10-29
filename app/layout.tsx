import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'BloomBrain Media — Creativity in Motion',description:'AI video production and video editing by BloomBrain Media. Explore cinematic films, UGC ads, real estate videos and social content.',icons:{icon:'/brand/bloombrain-lowercase.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
