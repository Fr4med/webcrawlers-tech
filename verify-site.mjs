import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const files = ['index.html', 'about.html', 'ai-visibility-audit.html', 'start.html', 'example.html', 'privacy.html', 'cookies.html', 'service.html', 'how-it-works.html', 'faq.html', 'what-is-geo.html', 'ai-visibility-audit-pricing.html', '404.html', ...['he', 'de', 'fr', 'pl', 'sv'].map((lang) => `${lang}/index.html`),...['signup','signin','terms','forgot-password','reset-password','verify-email'].map(route=>route+'.html').filter(file=>existsSync(resolve(import.meta.dirname,file)))];
let failures = 0;
const fail = (file, message) => { console.error(`${file}: ${message}`); failures++; };

for (const file of files) {
  const html = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
  if (/webcrawlers-swarm|interactive (sample )?demo|public demo/i.test(html)) fail(file, 'private operator or demo promotion in public page');
  if (!html.includes('<!doctype html>') || !html.includes('</html>')) fail(file, 'incomplete HTML document');
  if (!/<html lang="[a-z]+"/.test(html)) fail(file, 'missing document language');
  if (!/<meta name="viewport"/.test(html)) fail(file, 'missing viewport');
  if (!html.includes('href="/assets/refined.css"')) fail(file, 'missing shared customer theme');
  if (!html.includes('src="/assets/cookie-preferences.js"') || !html.includes('href="/assets/cookie-preferences.css"')) fail(file, 'missing privacy preference controls');
  if (!/<footer\b[\s\S]*?href="\/cookies"[^>]*data-cookie-settings/.test(html)) fail(file, 'missing footer cookie settings link');
  const preferencesAt = html.indexOf('src="/assets/cookie-preferences.js"');
  const inquiryAt = html.search(/src="\/assets\/(?:launch|inquiry)\.js"/);
  if (inquiryAt >= 0 && preferencesAt > inquiryAt) fail(file, 'privacy preferences must load before enquiry scripts');
  if (file.includes('/index.html')) {
    if (!/<input[^>]*id="lead-consent"[^>]*required/.test(html)) fail(file, 'missing required contact consent');
    if (!html.includes('href="/privacy"') || !html.includes('href="/service"')) fail(file, 'missing policy links');
    if (!html.includes('id="lead-reference"') || !html.includes('data-retry=')) fail(file, 'missing reference or retry explanation');
    if (!html.includes('src="/assets/inquiry.js"')) fail(file, 'missing shared inquiry delivery handler');
  }
  for (const [, src] of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
    if (!src.startsWith('/')) continue;
    const scriptPath = resolve(import.meta.dirname, src.slice(1));
    if (!existsSync(scriptPath)) fail(file, `missing script ${src}`);
    else { try { new Function(readFileSync(scriptPath, 'utf8')); } catch (error) { fail(file, `invalid ${src}: ${error.message}`); } }
  }
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
