import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {runInNewContext} from 'node:vm';
import {withAccountNavigation} from '../scripts/account-navigation.mjs';
import {renderLocale} from '../generate-locales.mjs';

const root = resolve(import.meta.dirname,'..');
const script = readFileSync(resolve(root,'assets/account-entry.js'),'utf8');
const workspace = 'wc-12345678-1234-4abc-8abc-123456789abc';
function redirect(route, search = '', blocked = false) {
  const fallback = {href:`https://app.webcrawlers.tech/${route}`};
  const calls = [];
  runInNewContext(script,{
    URL, URLSearchParams,
    document:{currentScript:{dataset:{accountEntry:route}},getElementById:() => fallback},
    window:{location:{search,hash:'#private-token',replace:href => {
      assert.equal(fallback.href,href,'fallback must be ready before redirect');
      calls.push(href);
      if(blocked) throw new Error('Navigation blocked');
    }}},
  });
  return {fallback:fallback.href,calls};
}

test('Marketing continuation forwards only one valid workspace to a fixed app origin',()=>{
  for (const route of ['signin','signup']) {
    const expected = `https://app.webcrawlers.tech/${route}?workspace=${workspace}`;
    assert.deepEqual(redirect(route,`?workspace=${workspace}&next=https://example.org&token=secret&email=private%40example.org`).calls,[expected]);
    assert.equal(redirect(route,`?workspace=${workspace}`,true).fallback,expected);
    assert.deepEqual(redirect(route).calls,[`https://app.webcrawlers.tech/${route}`]);
  }
});

test('Malformed or ambiguous workspace values and attacker destinations are discarded',()=>{
  for(const query of [
    '?workspace=', '?workspace=other-customer', `?workspace=${workspace}&workspace=${workspace}`,
    `?workspace=${workspace}%2F..`, `?workspace=${workspace}%00`,
    `?workspace=${workspace.toUpperCase()}`, '?workspace=wc-12345678-1234-1abc-8abc-123456789abc',
    '?workspace=wc-12345678-1234-4abc-7abc-123456789abc',
    '?next=//example.org&redirect=https://example.org&token=secret',
  ]) assert.deepEqual(redirect('signin',query).calls,['https://app.webcrawlers.tech/signin'],query);
  assert.deepEqual(redirect('//example.org').calls,[]);
  assert.deepEqual(redirect(undefined).calls,[]);
});

test('Account continuation stays accessible without JavaScript and discloses the beta limits',()=>{
  for(const route of ['signin','signup']) {
    const html = readFileSync(resolve(root,`src/pages/${route}.html`),'utf8');
    assert.ok(html.includes('<meta name="referrer" content="no-referrer">'));
    assert.match(html,new RegExp(`<a id="account-continue" class="button" href="https://app\\.webcrawlers\\.tech/${route}" rel="noreferrer">Continue to `));
    assert.ok(html.includes(`<script src="/assets/account-entry.js" data-account-entry="${route}" defer></script>`));
    assert.ok(html.includes('save your project brief and sign in again'));
    assert.ok(html.includes('Automated audits, MCP connections, account emails and payments are not enabled'));
    assert.ok(!/accounts are not open|not public yet/.test(html));
    assert.equal(readFileSync(resolve(root,`${route}.html`),'utf8'),html);
  }
});

test('Navigation generation preserves locale labels and consistently uses the hosted app',()=>{
  for(const lang of ['he','de','fr','pl','sv']) {
    const html = withAccountNavigation(renderLocale(lang));
    assert.equal(withAccountNavigation(html),html);
    assert.match(html,/href="https:\/\/app\.webcrawlers\.tech\/signin" class="account-signin" title="Account pages are in English"/);
    assert.match(html,/href="https:\/\/app\.webcrawlers\.tech\/signup" class="button small" title="Account pages are in English"/);
    assert.doesNotMatch(html,/href="\/(?:signin|signup)"/);
  }
  assert.equal(withAccountNavigation('<a href="/signin" class="account-signin">Sign in</a>'),'<a href="https://app.webcrawlers.tech/signin" class="account-signin">Sign in</a>');
});

test('Every source and generated marketing page has hosted account navigation',()=>{
  function visit(directory,prefix='') {
    for(const entry of readdirSync(directory,{withFileTypes:true})) {
      const file = resolve(directory,entry.name);
      const relative = prefix + entry.name;
      if(entry.isDirectory()) { visit(file,relative+'/'); continue; }
      if(!entry.name.endsWith('.html')) continue;
      const html = readFileSync(file,'utf8');
      assert.doesNotMatch(html,/href="\/(?:signin|signup)"/,relative);
      assert.ok(html.includes('href="https://app.webcrawlers.tech/signin" class="account-signin"'),relative);
      assert.ok(html.includes('href="https://app.webcrawlers.tech/signup" class="button small"'),relative);
      assert.equal(readFileSync(resolve(root,relative),'utf8'),html,relative+' source/build drift');
    }
  }
  visit(resolve(root,'src/pages'));
});
