import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

export const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const languages = [
  ['en', '/', 'English'], ['he', '/he/', 'עברית'], ['de', '/de/', 'Deutsch'],
  ['fr', '/fr/', 'Français'], ['pl', '/pl/', 'Polski'], ['sv', '/sv/', 'Svenska'],
];
export function homepageAlternates() {
  return [...languages, ['x-default', '/']].map(([lang,path]) =>
    `<link rel="alternate" hreflang="${lang}" href="https://webcrawlers.tech${path}">`).join('\n');
}
export function languageSelector(current = 'en', label = 'Language') {
  return `<nav class="wc-language-bar container" aria-label="${label}">${languages.map(([code,path,name]) =>
    `<a href="${path}" lang="${code}" hreflang="${code}"${code===current?' aria-current="page"':''}>${name}</a>`).join('')}</nav>`;
}
export function applyReviewMetadata(html) {
  let next = html.replace(/<link\b[^>]*rel="alternate"[^>]*hreflang="[^"]+"[^>]*>\s*/g, '');
  next = next.replace('</head>', `${homepageAlternates()}\n</head>`);
  next = next.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (block, body) => {
    const data = JSON.parse(body);
    if (data['@type'] !== 'Organization') return block;
    return `<script type="application/ld+json">${JSON.stringify({...data, '@id':'https://webcrawlers.tech/#org'})}</script>`;
  });
  return next;
}

const digest = text => createHash('sha256').update(text).digest('hex');
function manifestPath(root) { return resolve(root, 'content-updates.json'); }
function readManifest(root) {
  return existsSync(manifestPath(root)) ? JSON.parse(readFileSync(manifestPath(root), 'utf8')) : {version:1, pages:{}};
}
// Call explicitly after reviewing a substantive edit. A build never chooses a date.
export function recordContentUpdates(files, date, root = siteRoot) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date) throw new Error('Use an actual YYYY-MM-DD content date');
  const record = readManifest(root);
  for (const file of files) {
    if (file.includes('..') || file.startsWith('/') || !file.endsWith('.html')) throw new Error('Expected a source-relative HTML filename');
    const source = readFileSync(resolve(root, 'src/pages', file));
    record.pages[file] = {date, sha256:digest(source)};
  }
  writeFileSync(manifestPath(root), JSON.stringify(record,null,2)+'\n');
  return record;
}
export function verifiedContentDate(file, root = siteRoot) {
  const entry = readManifest(root).pages[file];
  const path = resolve(root, 'src/pages', file);
  if (!entry || !existsSync(path) || entry.sha256 !== digest(readFileSync(path))) return null;
  return entry.date;
}
export function updateSitemap(root = siteRoot) {
  const path = resolve(root, 'sitemap.xml');
  const original = readFileSync(path, 'utf8');
  const old = original.replace(/\r\n?/g,'\n');
  const next = old.replace(/<url>([\s\S]*?)<\/url>/g, (whole, inner) => {
    const match = inner.match(/<loc>([^<]+)<\/loc>/);
    if (!match) return whole;
    const route = new URL(match[1]).pathname;
    const file = route==='/'?'index.html':route.endsWith('/')?route.slice(1)+'index.html':route.slice(1)+'.html';
    const date = verifiedContentDate(file, root);
    return `  <url><loc>${match[1]}</loc>${date?`<lastmod>${date}</lastmod>`:''}</url>`;
  }).replace(/^\s+(?=<url>)/gm,'  ');
  if (next !== original) writeFileSync(path,next);
  return next;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--record') {
    const [, , , date, ...files] = process.argv;
    if (!files.length) throw new Error('Supply a date and changed source HTML files');
    recordContentUpdates(files,date);
  }
  updateSitemap();
  console.log('Sitemap dates match explicitly reviewed source hashes; unknown dates are omitted.');
}
