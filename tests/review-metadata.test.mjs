import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {homepageAlternates,languageSelector,applyReviewMetadata,recordContentUpdates,verifiedContentDate,updateSitemap,siteRoot,languages} from '../scripts/review-metadata.mjs';
import {renderLocale} from '../generate-locales.mjs';

test('Each translated page shares navigation, consent and receipt handling with explicit English destinations',()=>{
  for(const [lang] of languages.filter(([code])=>code!=='en')){
    const html=renderLocale(lang);
    assert.ok(html.includes('class="site-header"'));
    assert.ok(html.includes('class="footer container"'));
    assert.ok(html.includes('webcrawlers<span class="brand-dot">.</span>'));
    assert.ok(html.includes(homepageAlternates()));
    assert.ok(html.includes(languageSelector(lang,({de:'Sprache',fr:'Langue',pl:'Język',sv:'Språk',he:'שפה'})[lang])));
    assert.ok(html.includes('src="/assets/inquiry.js"'));
    assert.ok(html.includes('src="/assets/analytics.js"'));
    assert.ok(html.includes('src="/assets/accessibility.js"'));
    assert.ok(/id="lead-consent"[^>]*required/.test(html));
    assert.ok(html.includes('data-retry='));
    assert.ok(html.includes('id="lead-reference"'));
    assert.ok(html.includes('href="/start"'));
    assert.equal(html.indexOf('src="/assets/cookie-preferences.js"') < html.indexOf('src="/assets/inquiry.js"'),true);
    assert.ok(!html.includes('href="/assets/site.css"'));
    const englishDestinations=[...html.matchAll(/<a href="\/(?:ai-visibility-audit|how-it-works|ai-visibility-audit-pricing|about|faq|accessibility)">([\s\S]*?)<\/a>/g)];
    for(const [,label] of englishDestinations) assert.ok(label.includes('wc-destination-language')||label.includes(' · '));
  }
});

test('Home metadata has the six real equivalents, x-default and a resolvable organization ID',()=>{
  const source=readFileSync(resolve(siteRoot,'src/pages/index.html'),'utf8');
  const once=applyReviewMetadata(source);
  assert.equal(applyReviewMetadata(once),once);
  assert.equal([...once.matchAll(/<link rel="alternate" hreflang=/g)].length,7);
  const org=[...once.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).find(x=>x['@type']==='Organization');
  assert.equal(org['@id'],'https://webcrawlers.tech/#org');
});

test('Article structured headline, description and date match visible current content; publication date stays historical',()=>{
  const html=readFileSync(resolve(siteRoot,'src/pages/what-is-geo.html'),'utf8');
  const data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const strip=s=>s.replace(/<br\s*\/?\s*>/g,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  assert.equal(data.headline,strip(html.match(/<h1>([\s\S]*?)<\/h1>/)[1]));
  assert.equal(data.description,strip(html.match(/<p class="intro">([\s\S]*?)<\/p>/)[1]));
  assert.ok(html.includes(`<time datetime="${data.dateModified}">`));
  assert.equal(data.datePublished,'2026-08-12');
  assert.equal(data.publisher['@id'],'https://webcrawlers.tech/#org');
});

test('Sitemap only carries reviewed content dates; an unrecorded edit removes rather than invents lastmod',()=>{
  const base=resolve(siteRoot,'.local-checks');mkdirSync(base,{recursive:true});
  const root=mkdtempSync(resolve(base,'metadata-'));
  mkdirSync(resolve(root,'src/pages'),{recursive:true});
  writeFileSync(resolve(root,'src/pages/index.html'),'<h1>One</h1>');
  writeFileSync(resolve(root,'sitemap.xml'),'<urlset><url><loc>https://webcrawlers.tech/</loc><lastmod>2020-01-01</lastmod></url></urlset>');
  assert.equal(verifiedContentDate('index.html',root),null);
  assert.ok(!updateSitemap(root).includes('lastmod'));
  recordContentUpdates(['index.html'],'2026-10-21',root);
  assert.equal(verifiedContentDate('index.html',root),'2026-10-21');
  assert.ok(updateSitemap(root).includes('<lastmod>2026-10-21</lastmod>'));
  writeFileSync(resolve(root,'src/pages/index.html'),'<h1>Changed</h1>');
  assert.equal(verifiedContentDate('index.html',root),null);
  assert.ok(!updateSitemap(root).includes('lastmod'));
  assert.throws(()=>recordContentUpdates(['index.html'],'2026-02-31',root));
  assert.throws(()=>recordContentUpdates(['../index.html'],'2026-10-21',root));
});
