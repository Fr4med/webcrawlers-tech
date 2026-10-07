import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const files=['index.html','about.html','ai-visibility-audit.html','start.html','example.html','privacy.html','cookies.html','service.html','how-it-works.html','faq.html','what-is-geo.html','ai-visibility-audit-pricing.html','404.html',...['he','de','fr','pl','sv'].map(lang=>lang+'/index.html'),...['signup','signin','terms','forgot-password','reset-password','verify-email'].map(route=>route+'.html').filter(file=>existsSync(new URL('src/pages/'+file,import.meta.url)))];
let changed=0;
for(const file of files){const source=new URL('src/pages/'+file,import.meta.url),target=new URL(file,import.meta.url);const bytes=readFileSync(source);if(!existsSync(target)||!readFileSync(target).equals(bytes)){mkdirSync(dirname(fileURLToPath(target)),{recursive:true});writeFileSync(target,bytes);changed++;}}
console.log(`Refined customer theme: ${files.length} source pages, ${changed} changed outputs.`);
