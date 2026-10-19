import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=(file:string)=>readFileSync(new URL('../assets/'+file,import.meta.url),'utf8');
function setup(options:any={}) {
 const store=options.store||new Map(), calls:any[]=[], listeners=new Map<string,Function[]>();
 let clock=Date.now(),cookie=options.cookie||'';
 const document:any={readyState:'loading',body:{dataset:{}},documentElement:{lang:'en'},visibilityState:'visible',referrer:options.referrer||'https://www.linkedin.com/private/path?secret=do-not-copy',addEventListener(t:string,f:Function){listeners.set(t,[...(listeners.get(t)||[]),f]);},dispatchEvent(e:any){for(const f of listeners.get(e.type)||[])f(e);}};
 Object.defineProperty(document,'cookie',{get:()=>cookie,set:(s:string)=>cookie=s.split(';')[0]});
 const sandbox:any={document,location:{hostname:options.host||'webcrawlers.tech',protocol:'https:',pathname:options.path||'/start',search:options.search||'',href:'https://webcrawlers.tech/start',origin:'https://webcrawlers.tech'},navigator:{globalPrivacyControl:options.gpc,doNotTrack:options.dnt},innerWidth:390,Date:class extends Date{static now(){return clock;}},URL,URLSearchParams,crypto,CustomEvent,AbortController,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:(k:string)=>store.get(k)||null,setItem:(k:string,v:string)=>{if(options.noStorage)throw Error('blocked');store.set(k,v);},removeItem:(k:string)=>store.delete(k)},addEventListener(t:string,f:Function){listeners.set(t,[...(listeners.get(t)||[]),f]);},fetch:(url:string,opts:any)=>{calls.push({url,opts,data:JSON.parse(opts.body)});return options.pending?new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>reject(Error('aborted')))):Promise.resolve({ok:true});},WebCrawlersAnalyticsConfig:{host:'https://eu.i.posthog.com',token:'phc_fixture'}};
 sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(source('cookie-preferences.js'),sandbox);vm.runInContext(source('analytics.js'),sandbox);
 return {sandbox,calls,store,privacy:sandbox.WebCrawlersPrivacy,capture:sandbox.WebCrawlersAnalytics.capture,setClock:(t:number)=>clock=t,clock:()=>clock,cookie:()=>cookie,setCookie:(s:string)=>cookie=s,dispatch:(t:string)=>document.dispatchEvent({type:t})};
}
test('no consent, old policy and attribution-only choices cannot send analytics',()=>{
 for(const cookie of ['', 'webcrawlers_privacy='+encodeURIComponent(JSON.stringify({schemaVersion:1,policyRevision:'2026-10-07',decidedAt:Date.now(),attribution:true}))]) {
  const c=setup({cookie});c.capture('enquiry_started');expect(c.calls).toHaveLength(0);expect(c.store.size).toBe(0);
  c.privacy.setPreferences({attribution:true});c.capture('enquiry_started');expect(c.calls).toHaveLength(0);expect(c.privacy.allows('analytics')).toBe(false);
 }
});
test('consent sends only minimized fields and recognized source labels',()=>{
 const c=setup({search:'?utm_source=linkedin&utm_medium=social&utm_campaign=launch&email=private@example.test&token=secret'});
 c.privacy.setPreferences({analytics:true});c.capture('enquiry_submit_attempted',{email:'private@example.test',note:'private text',reference:'PRIVATE-REF',step:2});
 expect(c.calls.map(x=>x.data.event)).toEqual(['$pageview','enquiry_submit_attempted']);
 const {data,opts,url}=c.calls[1];expect(url).toBe('https://eu.i.posthog.com/i/v0/e/');expect(opts.credentials).toBe('omit');expect(opts.referrerPolicy).toBe('no-referrer');expect(opts.keepalive).toBe(true);
 expect(data.properties).toMatchObject({$current_url:'https://webcrawlers.tech/start',source:'linkedin',medium:'social',campaign:'launch',$process_person_profile:false,$geoip_disable:true,$ip:null,step:2});
 for(const secret of ['private@example.test','private text','PRIVATE-REF','secret','private/path'])expect(JSON.stringify(data)).not.toContain(secret);
 expect(c.privacy.allows('attribution')).toBe(false);
 c.capture('arbitrary',{note:'test'});expect(c.calls).toHaveLength(2);
});
test('withdrawal aborts in-flight sends, drops optional storage and never retries',async()=>{
 const c=setup({pending:true});c.privacy.setPreferences({analytics:true});expect(c.calls).toHaveLength(1);const signal=c.calls[0].opts.signal;
 c.privacy.setPreferences({analytics:false});expect(signal.aborted).toBe(true);expect(c.store.has('webcrawlers-analytics-session-v1')).toBe(false);
 c.capture('enquiry_started');c.dispatch('pageshow');expect(c.calls).toHaveLength(1);await Promise.resolve();
});
test('external cookie withdrawal and expiry are checked before every event',()=>{
 for(const mode of ['withdrawal','expiry']){
  const c=setup();c.privacy.setPreferences({analytics:true});
  if(mode==='withdrawal')c.setCookie('');else c.setClock(c.clock()+180*86400000);
  c.capture('enquiry_started');expect(c.calls).toHaveLength(1);expect(c.store.has('webcrawlers-analytics-session-v1')).toBe(false);
 }
});
test('session survives navigation for at most 30 minutes; no persistent identity',()=>{
 const c=setup();c.privacy.setPreferences({analytics:true});const id=c.calls[0].data.distinct_id;
 c.capture('enquiry_started');expect(c.calls[1].data.distinct_id).toBe(id);
 const next=setup({store:c.store,cookie:c.cookie()});expect(next.calls[0].data.distinct_id).toBe(id);
 next.setClock(next.clock()+1800001);next.capture('enquiry_submit_attempted');expect(next.calls.at(-1).data.distinct_id).not.toBe(id);
});
test('DNT, GPC, non-production hosts and private routes fail closed',()=>{
 for(const options of [{gpc:true},{dnt:'1'},{host:'localhost'},{host:'example.test'},{path:'/reset-password/private-token'}]){
  const c=setup(options);c.privacy.setPreferences({analytics:true});c.capture('enquiry_started');expect(c.calls).toHaveLength(0);
 }
});
test('confirmed retries deduplicate locally and request references never reach PostHog',()=>{
 const c=setup();c.privacy.setPreferences({analytics:true});c.capture('enquiry_receipt_unconfirmed',{reference:'PRIVATE'});
 c.capture('enquiry_receipt_confirmed',{reference:'PRIVATE'});c.capture('enquiry_receipt_confirmed',{reference:'PRIVATE'});
 expect(c.calls.filter(x=>x.data.event==='enquiry_receipt_confirmed')).toHaveLength(1);expect(JSON.stringify(c.calls.map(x=>x.data))).not.toContain('PRIVATE');
});
test('bad campaign values and injected storage cannot become event properties',()=>{
 const c=setup({search:'?utm_source=private-name&utm_medium=private-phone&utm_campaign=customer-secret'});
 c.privacy.setPreferences({analytics:true});expect(c.calls[0].data.properties).toMatchObject({source:'linkedin',medium:'unspecified',campaign:'unspecified'});
 const saved=JSON.parse(c.store.get('webcrawlers-analytics-session-v1'));saved.private='SECRET';saved.source='SECRET';c.store.set('webcrawlers-analytics-session-v1',JSON.stringify(saved));
 c.capture('enquiry_started');expect(JSON.stringify(c.calls.at(-1).data)).not.toContain('SECRET');
});
test('unavailable storage does not break forms, and capture is bounded to 100 events per visit',()=>{
 const c=setup({noStorage:true});c.privacy.setPreferences({analytics:true});for(let i=0;i<150;i++)c.capture('assessment_cta_clicked');expect(c.calls).toHaveLength(100);
});
test('all 18 pages load consent before analytics and form scripts; no personal API key is public',()=>{
 const pages=['index','start','about','ai-visibility-audit','ai-visibility-audit-pricing','example','privacy','cookies','service','how-it-works','faq','what-is-geo','404',...['he','de','fr','pl','sv'].map(x=>x+'/index')];
 for(const page of pages){const html=readFileSync(new URL('../src/pages/'+page+'.html',import.meta.url),'utf8');expect(html.indexOf('cookie-preferences.js')).toBeLessThan(html.indexOf('analytics.js'));expect(html.indexOf('analytics.js')).toBeLessThan(html.indexOf('launch.js'));}
 expect(source('analytics-config.js')).not.toMatch(/phx_/);expect(source('analytics.js')).not.toMatch(/sendBeacon/);
});
