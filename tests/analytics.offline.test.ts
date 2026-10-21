import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=(file:string)=>readFileSync(new URL('../assets/'+file,import.meta.url),'utf8');
function setup(options:any={}) {
 const store=options.store||new Map(), calls:any[]=[], scripts:any[]=[], listeners=new Map<string,Function[]>();
 let clock=Date.now(),cookie=options.cookie||'';
 const document:any={readyState:'loading',body:{dataset:{}},head:{append:(script:any)=>scripts.push(script)},createElement:()=>({}),documentElement:{lang:'en'},visibilityState:'visible',referrer:options.referrer||'https://www.linkedin.com/private/path?secret=do-not-copy',addEventListener(t:string,f:Function){listeners.set(t,[...(listeners.get(t)||[]),f]);},dispatchEvent(e:any){for(const f of listeners.get(e.type)||[])f(e);}};
 Object.defineProperty(document,'cookie',{get:()=>cookie,set:(s:string)=>cookie=s.split(';')[0]});
 const sandbox:any={document,location:{hostname:options.host||'webcrawlers.tech',protocol:'https:',pathname:options.path||'/start',search:options.search||'',href:'https://webcrawlers.tech/start',origin:'https://webcrawlers.tech'},navigator:{globalPrivacyControl:options.gpc,doNotTrack:options.dnt},innerWidth:390,Date:class extends Date{static now(){return clock;}},URL,URLSearchParams,crypto,CustomEvent,AbortController,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:(k:string)=>store.get(k)||null,setItem:(k:string,v:string)=>{if(options.noStorage)throw Error('blocked');store.set(k,v);},removeItem:(k:string)=>store.delete(k)},addEventListener(t:string,f:Function){listeners.set(t,[...(listeners.get(t)||[]),f]);},fetch:(url:string,opts:any)=>{calls.push({url,opts,data:JSON.parse(opts.body)});return options.pending?new Promise((_,reject)=>opts.signal.addEventListener('abort',()=>reject(Error('aborted')))):Promise.resolve({ok:true});},WebCrawlersAnalyticsConfig:{host:'https://eu.i.posthog.com',token:'phc_fixture'}};
 if(options.google)sandbox.WebCrawlersAnalyticsConfig.googleMeasurementId='G-BN1WD64QZ5';
 sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(source('cookie-preferences.js'),sandbox);vm.runInContext(source('analytics.js'),sandbox);
 return {sandbox,calls,scripts,store,privacy:sandbox.WebCrawlersPrivacy,capture:sandbox.WebCrawlersAnalytics.capture,setClock:(t:number)=>clock=t,clock:()=>clock,cookie:()=>cookie,setCookie:(s:string)=>cookie=s,dispatch:(t:string)=>document.dispatchEvent({type:t})};
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
 const pages=['index','start','about','ai-visibility-audit','ai-visibility-audit-pricing','accessibility','privacy','cookies','service','how-it-works','faq','what-is-geo','404',...['he','de','fr','pl','sv'].map(x=>x+'/index')];
 for(const page of pages){const html=readFileSync(new URL('../src/pages/'+page+'.html',import.meta.url),'utf8');expect(html.indexOf('cookie-preferences.js')).toBeLessThan(html.indexOf('analytics.js'));expect(html.indexOf('analytics.js')).toBeLessThan(html.indexOf('launch.js'));}
 expect(source('analytics-config.js')).not.toMatch(/phx_/);expect(source('analytics.js')).not.toMatch(/sendBeacon/);
});

test('GA4 makes no tag request for no consent, old PostHog-only consent, DNT, GPC or private routes',()=>{
 const old='webcrawlers_privacy='+encodeURIComponent(JSON.stringify({schemaVersion:2,policyRevision:'2026-10-20',decidedAt:Date.now(),attribution:false,analytics:true}));
 for(const options of [{},{cookie:old},{dnt:'1'},{gpc:true},{path:'/reset-password/secret'},{host:'localhost'}]){
  const c=setup({...options,google:true});expect(c.scripts).toHaveLength(0);expect(c.sandbox['ga-disable-G-BN1WD64QZ5']).toBe(true);
  if(!('cookie' in options))c.privacy.setPreferences({analytics:false});expect(c.scripts).toHaveLength(0);
 }
});

test('GA4 loads once after opt-in with default-denied advertising and minimized explicit events',()=>{
 const c=setup({google:true,search:'?email=private@example.test&token=private-secret&utm_source=linkedin'});
 c.privacy.setPreferences({analytics:true});c.capture('enquiry_submit_attempted',{email:'private@example.test',reference:'PRIVATE-REF',step:3});
 expect(c.scripts).toHaveLength(1);expect(c.scripts[0]).toMatchObject({src:'https://www.googletagmanager.com/gtag/js?id=G-BN1WD64QZ5',referrerPolicy:'no-referrer'});
 const queue=Array.from(c.sandbox.dataLayer,(x:any)=>Array.from(x));
 expect(queue[0]).toEqual(['consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}]);
 const config:any=queue.find((x:any)=>x[0]==='config')?.[2];expect(config).toMatchObject({send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:'https://webcrawlers.tech/start',page_referrer:'',cookie_expires:1800,cookie_update:false,cookie_domain:'none'});
 expect(config).not.toHaveProperty('debug_mode');
 expect(queue.filter(x=>x[0]==='event').map(x=>x[1])).toEqual(['page_view','enquiry_submit_attempted']);
 for(const secret of ['private@example.test','private-secret','PRIVATE-REF','private/path'])expect(JSON.stringify(queue)).not.toContain(secret);
});

test('GA4 counts a confirmed receipt as a lead once and keeps unconfirmed attempts separate',()=>{
 const c=setup({google:true});c.privacy.setPreferences({analytics:true});
 c.capture('enquiry_receipt_unconfirmed',{reference:'PRIVATE'});c.capture('enquiry_receipt_confirmed',{reference:'PRIVATE'});c.capture('enquiry_receipt_confirmed',{reference:'PRIVATE'});
 const events=c.sandbox.dataLayer.filter((x:any)=>x[0]==='event').map((x:any)=>x[1]);expect(events).toEqual(['page_view','enquiry_receipt_unconfirmed','generate_lead']);
 expect(JSON.stringify(c.sandbox.dataLayer)).not.toContain('PRIVATE');
});

test('withdrawal disables GA4 before consent update and clears queued events without loading again',()=>{
 const c=setup({google:true});c.privacy.setPreferences({analytics:true});c.capture('enquiry_started');
 c.privacy.setPreferences({analytics:false});expect(c.sandbox['ga-disable-G-BN1WD64QZ5']).toBe(true);
 expect(c.sandbox.dataLayer.filter((x:any)=>x[0]==='event')).toHaveLength(0);
 c.capture('enquiry_submit_attempted');expect(c.scripts).toHaveLength(1);
 c.privacy.setPreferences({analytics:true});expect(c.scripts).toHaveLength(1);expect(c.sandbox['ga-disable-G-BN1WD64QZ5']).toBe(false);
});

test('blocked GA4 does not retry or prevent enquiry events reaching PostHog',()=>{
 const c=setup({google:true});c.privacy.setPreferences({analytics:true});c.scripts[0].onerror();
 c.capture('enquiry_submit_attempted');expect(c.scripts).toHaveLength(1);expect(c.sandbox['ga-disable-G-BN1WD64QZ5']).toBe(true);
 expect(c.calls.at(-1).data.event).toBe('enquiry_submit_attempted');expect(c.sandbox.dataLayer).toHaveLength(0);
});

test('GA4 QA events are labelled debug and a new visit replaces the Google client ID',()=>{
 const c=setup({google:true,search:'?wc_qa=posthog-install-20261020'});c.privacy.setPreferences({analytics:true});
 const event=c.sandbox.dataLayer.find((x:any)=>x[0]==='event');expect(event[2]).toMatchObject({debug_mode:true,environment:'qa'});
 const client=c.sandbox.dataLayer.find((x:any)=>x[0]==='config')[2].client_id;
 expect(c.sandbox.dataLayer.find((x:any)=>x[0]==='config')[2].debug_mode).toBe(true);
 c.setClock(c.clock()+1800001);c.capture('assessment_cta_clicked');const configs=c.sandbox.dataLayer.filter((x:any)=>x[0]==='config');expect(configs.at(-1)[2].client_id).not.toBe(client);
});
