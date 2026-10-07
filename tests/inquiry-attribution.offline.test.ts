import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const asset=(name:string)=>readFileSync(fileURLToPath(new URL('../assets/'+name,import.meta.url)),'utf8');
function context(script:string,path='/start',search='',referrer='',active=false,storage=new Map<string,string>(),clock=Date.now(),allow:boolean|null=true,blockedCookies=false,unavailable=false,initialCookie?:string) {
 const nodes=new Map<string,any>();
 const node=(id:string)=>{if(!nodes.has(id))nodes.set(id,{id,value:id==='business'?'Fixture business':'',hidden:false,dataset:{invalid:'invalid',sending:'sending',reference:'reference',received:'received',retry:'retry'},textContent:'',className:'',disabled:false,events:{},attrs:{},addEventListener(type:string,fn:any){this.events[type]=fn;},setAttribute(k:string,v:string){this.attrs[k]=v;},removeAttribute(k:string){delete this.attrs[k];},reportValidity(){return true;},querySelector(selector:string){return selector.includes('h2')?node('heading'):node('submit');},querySelectorAll(){return [];},replaceChildren(){},focus(){}});return nodes.get(id);};
 const english=script==='launch.js';const form=node(english?'project-form':'lead-form');
 const fields:any={name:'Fixture owner',email:'fixture@example.test',note:'TEST P04 offline',consent:'on',_hp:'',business:'Fixture business',offering:'Fixture service',website:'',context:'Fixture context'};
 const sent:any[]=[];let mode='match';
 let cookie=initialCookie??(allow===null?'':'webcrawlers_privacy='+encodeURIComponent(JSON.stringify({schemaVersion:1,policyRevision:'2026-10-07',decidedAt:clock,attribution:allow})));
 const writes:string[]=[],events:any[]=[];
 const document:any={referrer,readyState:'loading',body:{dataset:unavailable?{privacyAttribution:'unavailable'}:{}},documentElement:{lang:english?'en':'de'},getElementById(id:string){if(id==='project-form'||id==='lead-form')return active&&id===form.id?form:null;return node(id);},querySelector(){return null;},querySelectorAll(){return [];},addEventListener(){},dispatchEvent(event:any){events.push(event);},createElement(){return node('created');}};
 Object.defineProperty(document,'cookie',{get:()=>cookie,set:(value:string)=>{writes.push(value);if(!blockedCookies)cookie=value.split(';')[0];}});
 const sandbox:any={document,sessionStorage:{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)},Date:class extends Date{static now(){return clock;}},location:{pathname:path,search,protocol:'https:'},URL,URLSearchParams,CustomEvent,AbortSignal,crypto,Blob,setTimeout,addEventListener(){},FormData:class{constructor(){return Object.entries(fields)[Symbol.iterator]();}},fetch:async(url:string,options:any)=>{expect(url).toBe('https://intake.webcrawlers.tech/lead');const data=JSON.parse(options.body);sent.push(data);return {ok:true,json:async()=>({ok:true,...(mode==='missing'?{}:{reference:mode==='match'?data.request_id:'00000000-0000-4000-8000-000000000000'})})};}};
 sandbox.window=sandbox;
 vm.createContext(sandbox);vm.runInContext(asset('cookie-preferences.js'),sandbox);vm.runInContext(asset(script),sandbox);
 return {sandbox,nodes,fields,sent,form,storage,writes,events,privacy:sandbox.WebCrawlersPrivacy,cookie:()=>cookie,setCookie:(value:string)=>{cookie=value;},setClock:(value:number)=>{clock=value;},setMode:(value:string)=>{mode=value;},source:()=>vm.runInContext('inquiryAttribution()',sandbox)};
}

const optionalKey='webcrawlers-inquiry-entry-v1';
test('translated enquiry and shared UI scripts coexist and preserve receipt delivery',async()=>{
 const c=context('inquiry.js','/de/','?utm_source=qa','',true);
 expect(()=>vm.runInContext(asset('launch.js'),c.sandbox)).not.toThrow();
 await c.form.events.submit({preventDefault(){}});
 expect(c.sent).toHaveLength(1);
 expect(c.sent[0].lang).toBe('de');
 expect(c.sent[0].consent).toBe(true);
 expect(c.nodes.get('lead-msg').className).toBe('ok');
});
for(const script of ['launch.js','inquiry.js']){
 test(script+' first visit and essential-only choice omit optional source and preserve unrelated necessary storage',async()=>{
  for(const choice of [null,false]){
   const storage=new Map([[optionalKey,JSON.stringify({capturedAt:Date.now(),context:{schemaVersion:1,landingPath:'/',utmSource:'legacy'}})],['necessary-retry-reference','fixture-reference']]);
   const c=context(script,script==='launch.js'?'/start':'/de/','?utm_source=google&utm_campaign=private','https://chatgpt.com/c/private-chat',true,storage,Date.now(),choice);
   expect(c.privacy.getPreferences()).toEqual({essential:true,attribution:false});expect(c.privacy.allows('essential')).toBe(true);expect(c.privacy.allows('analytics')).toBe(false);
   expect(storage.has(optionalKey)).toBe(false);expect(storage.get('necessary-retry-reference')).toBe('fixture-reference');expect(c.writes.length).toBe(0);
   if(script==='launch.js'){c.nodes.get('form-next').events.click();c.nodes.get('form-next').events.click();}
   await c.form.events.submit({preventDefault(){}});
   expect(c.sent.length).toBe(1);expect(c.sent[0].attribution).toEqual({schemaVersion:1,landingPath:null,formPath:script==='launch.js'?'/start':'/de/'});
   expect(JSON.stringify(c.sent[0].attribution)).not.toContain('google');expect(JSON.stringify(c.sent[0].attribution)).not.toContain('private');expect(c.sent[0].consent).toBe(true);
  }
 });
 test(script+' allowing context works on the current page and withdrawal clears an already-open form before first dispatch',async()=>{
  const c=context(script,script==='launch.js'?'/start':'/de/','?utm_source=qa','https://bing.com/search?q=private',true,new Map(),Date.now(),false);
  c.privacy.setPreferences({attribution:true});expect(c.source().utmSource).toBe('qa');expect(c.storage.has(optionalKey)).toBe(true);
  c.privacy.setPreferences({attribution:false});expect(c.storage.has(optionalKey)).toBe(false);expect(c.source().landingPath).toBe(null);
  if(script==='launch.js'){c.nodes.get('form-next').events.click();c.nodes.get('form-next').events.click();}
  await c.form.events.submit({preventDefault(){}});
  expect(c.sent.length).toBe(1);expect(c.sent[0].attribution).toEqual({schemaVersion:1,landingPath:null,formPath:script==='launch.js'?'/start':'/de/'});
 });
 test(script+' expiry is rechecked on an open form before dispatch',async()=>{
  const clock=Date.now(),c=context(script,script==='launch.js'?'/start':'/de/','?utm_source=qa','https://bing.com/search?q=private',true,new Map(),clock);
  expect(c.source().utmSource).toBe('qa');c.setClock(clock+1800000);
  if(script==='launch.js'){c.nodes.get('form-next').events.click();c.nodes.get('form-next').events.click();}
  await c.form.events.submit({preventDefault(){}});
  expect(c.sent[0].attribution.landingPath).toBe(null);expect(c.sent[0].attribution.utmSource).toBeUndefined();expect(c.storage.has(optionalKey)).toBe(false);
 });
 test(script+' withdrawal after an unconfirmed send preserves the reference and blocks a possible duplicate',async()=>{
  const c=context(script,script==='launch.js'?'/start':'/de/','?utm_source=qa','https://bing.com/search?q=private',true);
  if(script==='launch.js'){c.nodes.get('form-next').events.click();c.nodes.get('form-next').events.click();}
  c.setMode('missing');await c.form.events.submit({preventDefault(){}});const reference=c.sent[0].request_id;
  c.privacy.setPreferences({attribution:false});expect(c.source().utmSource).toBeUndefined();expect(c.storage.has(optionalKey)).toBe(false);
  c.setMode('match');await c.form.events.submit({preventDefault(){}});
  expect(c.sent.length).toBe(1);expect(c.nodes.get(script==='launch.js'?'form-message':'lead-msg').textContent).toContain(reference);
  expect(c.nodes.get(script==='launch.js'?'form-message':'lead-msg').textContent).toContain('hello@webcrawlers.tech');
 });
 test(script+' expiry and field edits after an unconfirmed send never issue a fresh reference automatically',async()=>{
  for(const change of ['age','fields']){
   const clock=Date.now(),c=context(script,script==='launch.js'?'/start':'/de/','?utm_source=qa','',true,new Map(),clock);
   if(script==='launch.js'){c.nodes.get('form-next').events.click();c.nodes.get('form-next').events.click();}
   c.setMode('missing');await c.form.events.submit({preventDefault(){}});
   if(change==='age')c.setClock(clock+1800000);else {c.fields.note='Updated';c.fields.context='Updated';}
   await c.form.events.submit({preventDefault(){}});expect(c.sent.length).toBe(1);
  }
 });
}

test('preference cookie is bounded, versioned, host-only, secure on HTTPS and contains no enquiry identity',()=>{
 const c=context('launch.js','/start','?utm_source=qa','',false,new Map(),Date.now(),null);
 c.privacy.setPreferences({attribution:true});const header=c.writes.at(-1)!;
 expect(header).toContain('; Path=/');expect(header).toContain('; Max-Age=15552000');expect(header).toContain('; SameSite=Lax');expect(header).toContain('; Secure');expect(header).not.toContain('Domain=');
 const saved=JSON.parse(decodeURIComponent(c.cookie().split('=')[1]));
 expect(Object.keys(saved).sort()).toEqual(['schemaVersion','policyRevision','decidedAt','attribution'].sort());expect(saved.schemaVersion).toBe(1);expect(saved.policyRevision).toBe('2026-10-07');expect(saved.attribution).toBe(true);
 expect(header.length).toBeLessThan(512);expect(header).not.toContain('fixture');expect(header).not.toContain('utmSource');expect(c.events.at(-1).detail.saved).toBe(true);
});

test('missing, malformed, future, outdated and expired preference cookies fail closed before source collection',()=>{
 const clock=Date.now(),valid={schemaVersion:1,policyRevision:'2026-10-07',decidedAt:clock,attribution:true};
 const encode=(record:any)=>'webcrawlers_privacy='+encodeURIComponent(JSON.stringify(record));
 const cookies=['','webcrawlers_privacy=bad','webcrawlers_privacy=%E0%A4%A',encode({...valid,decidedAt:clock+1}),encode({...valid,decidedAt:clock-15552000000}),encode({...valid,policyRevision:'old'}),encode({...valid,attribution:'true'}),encode({...valid,extra:true}),encode(['yes'])];
 for(const cookie of cookies){
  const storage=new Map([[optionalKey,JSON.stringify({capturedAt:clock,context:{schemaVersion:1,landingPath:'/',utmSource:'legacy'}})]]);
  const c=context('launch.js','/start','?utm_source=qa','https://bing.com/search?q=private',false,storage,clock,null,false,false,cookie);
  expect(c.privacy.hasChoice()).toBe(false);expect(c.privacy.allows('attribution')).toBe(false);expect(c.source()).toEqual({schemaVersion:1,landingPath:null,formPath:'/start'});expect(storage.has(optionalKey)).toBe(false);expect(c.writes.length).toBe(0);
 }
});

test('a current explicit choice wins over an opposite old cookie when cookie writes are blocked',()=>{
 const clock=Date.now();
 for(const original of [true,false]){
  const c=context('launch.js','/start','?utm_source=qa','',false,new Map(),clock,original,true);
  c.privacy.setPreferences({attribution:!original});expect(c.privacy.allows('attribution')).toBe(!original);expect(c.privacy.hasChoice()).toBe(true);expect(c.events.at(-1).detail.saved).toBe(false);
  if(original){expect(c.source().utmSource).toBeUndefined();expect(c.storage.has(optionalKey)).toBe(false);}else expect(c.source().utmSource).toBe('qa');
  const reloaded=context('launch.js','/start','?utm_source=qa','',false,new Map(),clock,null,false,false,c.cookie());expect(reloaded.privacy.allows('attribution')).toBe(original);
  c.setClock(clock+15552000000);expect(c.privacy.allows('attribution')).toBe(false);expect(c.privacy.hasChoice()).toBe(false);
 }
});

test('customer pages without configured attribution cannot offer or enable nonfunctional optional context',()=>{
 const c=context('launch.js','/signup','?utm_source=qa','https://bing.com/',false,new Map(),Date.now(),true,false,true);
 expect(c.privacy.getPreferences()).toEqual({essential:true,attribution:false});expect(c.source()).toEqual({schemaVersion:1,landingPath:null,formPath:null});expect(c.storage.has(optionalKey)).toBe(false);
 c.privacy.setPreferences({attribution:true});expect(c.privacy.allows('attribution')).toBe(false);expect(JSON.parse(decodeURIComponent(c.cookie().split('=')[1])).attribution).toBe(false);
});
for(const script of ['launch.js','inquiry.js']) {
 test(script+' strips private referrer/query context, rejects repeated or text campaign values and preserves unknown source',()=>{
  const c=context(script,'/start','?utm_source=qa&utm_medium=local&utm_campaign=P04&token=private&chat=secret','https://chatgpt.com/c/private-chat?secret=private');
  expect(c.source()).toEqual({schemaVersion:1,landingPath:'/start',formPath:'/start',utmSource:'qa',utmMedium:'local',utmCampaign:'P04',referrerHost:'chatgpt.com'});
  const unknown=context(script,'/private-secret','?utm_source=private%20chat&utm_medium=local&utm_medium=dup&arbitrary=secret','http://localhost/private');
  expect(unknown.source()).toEqual({schemaVersion:1,landingPath:null,formPath:null});
  expect(context(script,'/start','','').source()).toEqual({schemaVersion:1,landingPath:'/start',formPath:'/start'});
  expect(context(script,'/start','','https://user:pass@chatgpt.com/c/private').source()).toEqual({schemaVersion:1,landingPath:'/start',formPath:'/start'});
 });
 test(script+' actual submit serializes bounded attribution; missing and wrong receipts retain same retry reference',async()=>{
  const english=script==='launch.js',c=context(script,english?'/start':'/de/','?utm_source=qa&utm_campaign=P04&private_chat=secret','https://bing.com/search?q=private',true);
  if(english){c.nodes.get('form-next').events.click();c.nodes.get('form-next').events.click();}
  const submit=()=>c.form.events.submit({preventDefault(){}});
  for(const mode of ['missing','mismatch','match']){c.setMode(mode);await submit();}
  expect(c.sent.length).toBe(3);expect(new Set(c.sent.map(x=>x.request_id)).size).toBe(1);
  expect(c.sent[0].attribution).toEqual({schemaVersion:1,landingPath:english?'/start':'/de/',formPath:english?'/start':'/de/',utmSource:'qa',utmCampaign:'P04',referrerHost:'bing.com'});
  expect(c.sent[0].consent).toBe(true);expect(JSON.stringify(c.sent[0].attribution)).not.toContain('secret');
  if(english)expect(c.nodes.get('form-success').hidden).toBe(false);else expect(c.nodes.get('lead-msg').className).toBe('ok');
  c.fields.note='TEST changed';c.fields.context='Changed context';await submit();expect(c.sent.at(-1).request_id).not.toBe(c.sent[0].request_id);
 });
}

for(const script of ['launch.js','inquiry.js']){
 test(script+' preserves Google home entry through form navigation, and freezes source on unchanged retry',async()=>{
  const storage=new Map<string,string>(),clock=Date.now();
  const home=context(script,'/','?utm_source=google&utm_medium=organic&utm_campaign=P04&private=secret','https://www.google.com/search?q=private',false,storage,clock);
  expect(home.source()).toEqual({schemaVersion:1,landingPath:'/',formPath:'/',utmSource:'google',utmMedium:'organic',utmCampaign:'P04',referrerHost:'www.google.com'});
  const form=context(script,script==='launch.js'?'/start':'/de/','','https://webcrawlers.tech/',true,storage,clock+1000);
  expect(form.source().landingPath).toBe('/');expect(form.source().referrerHost).toBe('www.google.com');
  if(script==='launch.js'){form.nodes.get('form-next').events.click();form.nodes.get('form-next').events.click();}
  form.setMode('missing');await form.form.events.submit({preventDefault(){}});
  storage.clear();form.sandbox.location.search='?utm_source=changed';form.sandbox.document.referrer='https://bing.com/changed';
  form.setMode('match');await form.form.events.submit({preventDefault(){}});
  expect(form.sent[1]).toEqual(form.sent[0]);expect(JSON.stringify([...storage])).not.toContain('secret');
 });
 test(script+' expired, malformed and unavailable storage does not invent original source',()=>{
  const clock=Date.now(),key='webcrawlers-inquiry-entry-v1';
  for(const value of ['bad json',JSON.stringify({capturedAt:clock-1800000,context:{schemaVersion:1,landingPath:'/',utmSource:'old'}}),JSON.stringify({capturedAt:clock+1,context:{schemaVersion:1,landingPath:'/'}}),JSON.stringify({capturedAt:clock,context:{schemaVersion:1,landingPath:'/',privateText:'secret'}})]){
   const storage=new Map([[key,value]]);const form=context(script,'/start','?utm_source=current','https://bing.com/',false,storage,clock);
   expect(form.source()).toEqual({schemaVersion:1,landingPath:null,formPath:'/start'});expect(JSON.stringify([...storage])).not.toContain('secret');
  }
  const unavailable=new Map<string,string>();unavailable.get=()=>{throw new Error('Storage disabled');};unavailable.set=()=>{throw new Error('Storage disabled');};
  expect(context(script,'/start','?utm_source=current','https://bing.com/',false,unavailable,clock).source()).toEqual({schemaVersion:1,landingPath:null,formPath:'/start'});
 });
}
