import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const files = ['index.html', 'how-it-works.html', 'faq.html', 'what-is-geo.html', 'ai-visibility-audit-pricing.html', '404.html', ...['he', 'de', 'fr', 'pl', 'sv'].map((lang) => `${lang}/index.html`)];
let failures = 0;
const fail = (file, message) => { console.error(`${file}: ${message}`); failures++; };

for (const file of files) {
  const html = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
  if (!html.includes('<!doctype html>') || !html.includes('</html>')) fail(file, 'incomplete HTML document');
  if (!/<html lang="[a-z]+"/.test(html)) fail(file, 'missing document language');
  if (!/<meta name="viewport"/.test(html)) fail(file, 'missing viewport');
  for (const [, href] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (!href.startsWith('/')) continue;
    const [path, anchor] = href.split('#');
    const local = path === '/' ? 'index.html' : path.endsWith('/') ? `${path.slice(1)}index.html` : path.includes('.') ? path.slice(1) : `${path.slice(1)}.html`;
    if (!existsSync(resolve(import.meta.dirname, local))) fail(file, `broken local link ${href}`);
    if (anchor && !new RegExp(`\\bid="${anchor}"`).test(readFileSync(resolve(import.meta.dirname, local), 'utf8'))) fail(file, `missing anchor ${href}`);
  }
  for (const [, body] of html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)) {
    try { new Function(body); } catch (error) { fail(file, `invalid script: ${error.message}`); }
  }
  for (const [, body] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(body); } catch (error) { fail(file, `invalid JSON-LD: ${error.message}`); }
  }
}

const home = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
for (const claim of ['one-click undo', 'Start free trial', '$99', '$290', '$700', 'ship automatically', 'Daily health checks']) {
  if (home.includes(claim)) fail('index.html', `unsupported offer claim: ${claim}`);
}
if (failures) process.exitCode = 1;
else console.log(`Checked ${files.length} pages: local links, anchors, scripts, metadata, and selected offer claims passed.`);
