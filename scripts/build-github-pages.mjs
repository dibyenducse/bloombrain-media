import {cpSync,mkdirSync,readFileSync,writeFileSync,existsSync,symlinkSync,rmSync} from 'node:fs';
import {resolve,dirname,basename,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.PAGES_BASE_PATH || '/bloombrain-media';
if(!/^\/[a-zA-Z0-9_-]+$/.test(base))throw new Error('PAGES_BASE_PATH must be a single repository path');
const mediaDir=resolve(process.env.PAGES_MEDIA_DIR || join(root,'public/media'));
const stage=join(root,'.pages-build');
rmSync(stage,{recursive:true,force:true});
mkdirSync(stage,{recursive:true});
for(const file of ['app/page.tsx','app/ai/page.tsx','app/general/page.tsx','app/privacy/page.tsx','app/layout.tsx','app/globals.css','components/portfolio.tsx','lib/collections.ts','lib/portfolio.json','lib/reviews.json']){
 mkdirSync(dirname(join(stage,file)),{recursive:true});cpSync(join(root,file),join(stage,file));
}
cpSync(join(root,'public'),join(stage,'public'),{recursive:true});
const videos=JSON.parse(readFileSync(join(stage,'lib/portfolio.json'),'utf8'));
for(const video of videos)for(const field of ['src','poster']){
 const name=basename(video[field]);const file=join(mediaDir,name);
 if(!existsSync(file))throw new Error(`Media copy missing: ${name}. Set PAGES_MEDIA_DIR to the backed-up media folder.`);
 mkdirSync(join(stage,'public/media'),{recursive:true});cpSync(file,join(stage,'public/media',name));
 video[field]=`${base}/media/${name}`;
}
writeFileSync(join(stage,'lib/portfolio.json'),JSON.stringify(videos,null,2));
const reviews=JSON.parse(readFileSync(join(stage,'lib/reviews.json'),'utf8'));
for(const review of reviews)review.photo=base+review.photo;
writeFileSync(join(stage,'lib/reviews.json'),JSON.stringify(reviews,null,2));
function prefixLinks(s){
 s=s.replace(/href="\/(?!\/)([^"]*)"/g,(_,path)=>`href="${base}/${path}${path && !path.includes('#') && !path.includes('.')?'/':''}"`);
 s=s.replace(/src="\/brand\//g,`src="${base}/brand/`);
 for(const route of ['ai','general'])s=s.replaceAll(`'/${route}'`,`'${base}/${route}/'`);
 return s;
}
const component=join(stage,'components/portfolio.tsx');let ui=readFileSync(component,'utf8');
const start=ui.indexOf('function track('),end=ui.indexOf('function Player(');
if(start<0||end<0)throw new Error('Portfolio analytics functions changed; review preview adapter');
ui=ui.slice(0,start)+"function track(_kind:'pageview'|'play',_video?:string){}\nfunction Consent(){return null}\n"+ui.slice(end);
ui=ui.replace("localStorage.removeItem('bb-consent');window.dispatchEvent(new Event('bb-consent-change'))", "window.alert('Analytics and admin sign-in are unavailable in this GitHub Pages preview. No visitor analytics are collected here.')");
ui=ui.replace('>Analytics settings</button>','>Preview info</button>');
writeFileSync(component,prefixLinks(ui));
for(const file of ['app/privacy/page.tsx','app/layout.tsx']){
 let text=readFileSync(join(stage,file),'utf8');text=prefixLinks(text).replace("icon:'/brand/",`icon:'${base}/brand/`);
 if(file.includes('privacy'))text=text.replace('<h1>A clear view of','<p>This GitHub Pages preview does not collect visitor analytics and has no sign-in service. The policy below describes the full hosted application.</p><h1>A clear view of');
 writeFileSync(join(stage,file),text);
}
mkdirSync(join(stage,'app/admin'),{recursive:true});
writeFileSync(join(stage,'app/admin/page.tsx'),`import {BrandLogo} from '@/components/portfolio';\nexport default function Page(){return <main className="login"><a className="brand" href="${base}/"><BrandLogo/></a><p className="eyebrow">GITHUB PAGES PREVIEW</p><h1>Your studio.<br/><em>Coming with hosting.</em></h1><p>This preview includes the complete public portfolio. Admin sign-in and visitor analytics require the hosted server and are not available here.</p><a className="button" href="${base}/">Back to portfolio ↗</a></main>}\n`);
writeFileSync(join(stage,'next.config.mjs'),`export default {output:'export',basePath:${JSON.stringify(base)},trailingSlash:true,images:{unoptimized:true},poweredByHeader:false};\n`);
writeFileSync(join(stage,'package.json'),JSON.stringify({name:'bloombrain-pages-preview',private:true,type:'module',dependencies:{next:'16.3.4',react:'19.2.6','react-dom':'19.2.6'}}));
writeFileSync(join(stage,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2017',lib:['dom','dom.iterable','esnext'],strict:true,noEmit:true,skipLibCheck:true,esModuleInterop:true,module:'esnext',moduleResolution:'bundler',resolveJsonModule:true,isolatedModules:true,jsx:'react-jsx',paths:{'@/*':['./*']},types:['node'],plugins:[{name:'next'}]},include:['**/*.ts','**/*.tsx','.next/types/**/*.ts'],exclude:['node_modules']}));
symlinkSync(join(root,'node_modules'),join(stage,'node_modules'),'dir');
execFileSync(process.execPath,[join(root,'node_modules/next/dist/bin/next'),'build','--webpack'],{cwd:stage,stdio:'inherit'});
writeFileSync(join(stage,'out/.nojekyll'),'');
writeFileSync(join(stage,'out/preview-build.json'),JSON.stringify({sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),builtAt:new Date().toISOString(),mode:'public-portfolio-preview',admin:false,analytics:false},null,2));
console.log(`GitHub Pages output: ${join(stage,'out')}`);
