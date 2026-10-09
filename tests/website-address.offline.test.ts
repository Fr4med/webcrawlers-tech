import {expect,test} from 'bun:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../assets/launch.js',import.meta.url),'utf8');
const sandbox:any={URL,document:{querySelector:()=>null,getElementById:()=>null,addEventListener:()=>{}}};
vm.createContext(sandbox);vm.runInContext(source,sandbox);
const normalize=(value:string)=>sandbox.normalizeWebsiteAddress(value);
test('website is optional, and business domains work without typing a scheme or www',()=>{
 expect(normalize('')).toBe('');expect(normalize('  ')).toBe('');
 for(const host of ['business.com','business.tech','business.co.il','business.photography','www.business.com'])expect(normalize(host)).toBe('https://'+host+'/');
 expect(normalize('  business.tech/services?source=search  ')).toBe('https://business.tech/services?source=search');
 expect(normalize('https://business.com/contact')).toBe('https://business.com/contact');
 expect(normalize('http://business.com')).toBe('http://business.com/');
 expect(normalize('//business.com')).toBe('https://business.com/');
 expect(normalize('business.com:8443/contact')).toBe('https://business.com:8443/contact');
 expect(normalize('bücher.de')).toBe('https://xn--bcher-kva.de/');
});
test('unsafe protocols, credentials and malformed addresses are rejected',()=>{
 for(const address of ['javascript:alert(1)','data:text/html,hi','file:///tmp/test','ftp://business.com','mailto:owner@business.com','https://owner:password@business.com','https://owner@business.com','https://','business','business .com','business.com\\contact','-business.com','business..com'])expect(()=>normalize(address)).toThrow();
});

test('the address limit applies after URL encoding, with a main-domain correction',()=>{
 const prefix='https://business.com/';
 expect(normalize('business.com/'+'a'.repeat(250-prefix.length))).toHaveLength(250);
 expect(()=>normalize('business.com/'+'a'.repeat(251-prefix.length))).toThrow('Use your main website address');
 const address='example.com/'+'商'.repeat(120);
 expect(address.length).toBeLessThan(250);
 expect(new URL('https://'+address).href.length).toBeGreaterThan(1000);
 expect(()=>normalize(address)).toThrow('Use your main website address');
});

function formHarness() {
 const fields:Record<string,string>={business:'Fixture business',website:'example.com',offering:'Fixture service',context:'Fixture context',name:'Fixture owner',email:'fixture@example.test',consent:'on',_hp:''};
 const nodes=new Map<string,any>(),sent:any[]=[];
 let references=0,mode='match';
 const node=(id:string):any=>{
  if(!nodes.has(id))nodes.set(id,{id,hidden:false,disabled:false,textContent:id==='form-step'?'STEP 01 OF 03':'',dataset:{},events:{},attrs:{},validationMessage:'',
   get value(){return fields[id]??'';},set value(value:string){fields[id]=value;},
   addEventListener(type:string,fn:any){this.events[type]=fn;},setCustomValidity(value:string){this.validationMessage=value;},
   checkValidity(){return !this.validationMessage;},reportValidity(){return !this.validationMessage;},
   setAttribute(key:string,value:string){this.attrs[key]=value;},removeAttribute(key:string){delete this.attrs[key];},
   querySelector(selector:string){return node('heading-'+selector);},
   querySelectorAll(selector:string){
    if(selector==='[data-panel]')return [0,1,2].map(panel=>{const item=node('panel-'+panel);item.dataset.panel=String(panel);return item;});
    if(selector==='button')return ['form-next','form-back','form-send','edit-brief'].map(node);
    const panel=selector.match(/data-panel="(\d)"/);if(panel)return (panel[1]==='0'?['business','website','offering']:panel[1]==='1'?['context']:['name','email']).map(node);
    return [];
   },replaceChildren(){},focus(){}});
  return nodes.get(id);
 };
 const form=node('project-form');node('form-step');
 const document={getElementById:node,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>node('created')};
 const runtime:any={URL,document,AbortSignal,Blob,setTimeout,crypto:{randomUUID:()=>`fixture-reference-${++references}`},
  FormData:class{constructor(){return Object.entries(fields)[Symbol.iterator]() as any;}},
  fetch:async(_url:string,options:any)=>{const data=JSON.parse(options.body);sent.push(data);return {ok:true,json:async()=>({ok:true,...(mode==='match'?{reference:data.request_id}:{})})};}};
 runtime.window=runtime;vm.createContext(runtime);vm.runInContext(source,runtime);
 return {fields,nodes,form,sent,referenceCount:()=>references,setMode:(value:string)=>{mode=value;},
  next:()=>node('form-next').events.click(),submit:()=>form.events.submit({preventDefault(){}}),
  website:(value:string)=>{node('website').value=value;node('website').events.input();}};
}

test('Unicode path overflow is blocked before Continue and dispatch, then accepts the main domain without a new reference',async()=>{
 const c=formHarness(),longAddress='example.com/'+'商'.repeat(120);
 c.website(longAddress);c.next();
 expect(c.nodes.get('form-step').textContent).toBe('STEP 01 OF 03');
 expect(c.nodes.get('website').validationMessage).toContain('Use your main website address');
 expect(c.sent).toHaveLength(0);expect(c.referenceCount()).toBe(1);
 c.website('example.com');c.next();c.next();
 c.website(longAddress);await c.submit();
 expect(c.nodes.get('form-step').textContent).toBe('STEP 01 OF 03');
 expect(c.nodes.get('form-message').textContent).toContain('Use your main website address');
 expect(c.sent).toHaveLength(0);expect(c.referenceCount()).toBe(1);
 c.website('example.com');c.next();c.next();await c.submit();
 expect(c.sent).toHaveLength(1);expect(c.sent[0].note).toContain('Website: https://example.com/');
 expect(c.sent[0].request_id).toBe('fixture-reference-1');expect(c.referenceCount()).toBe(1);
});

test('composed-note overflow is correctable before dispatch without allocating another request reference',async()=>{
 const c=formHarness();c.next();c.next();c.fields.context='Long notes '.repeat(120);
 await c.submit();
 expect(c.sent).toHaveLength(0);expect(c.referenceCount()).toBe(1);
 expect(c.nodes.get('form-message').textContent).toContain('Use Edit brief');
 expect(c.form.attrs['aria-busy']).toBeUndefined();
 c.fields.context='Fixture context';await c.submit();
 expect(c.sent).toHaveLength(1);expect(c.sent[0].note.length).toBeLessThanOrEqual(1000);
 expect(c.sent[0].request_id).toBe('fixture-reference-1');expect(c.referenceCount()).toBe(1);
});

test('an oversized edit does not discard an unconfirmed receipt or change its unchanged retry',async()=>{
 const c=formHarness();c.next();c.next();c.setMode('missing');await c.submit();
 const first=c.sent[0];c.fields.context='Long notes '.repeat(120);await c.submit();
 expect(c.sent).toHaveLength(1);expect(c.referenceCount()).toBe(1);
 c.fields.context='Changed valid context';await c.submit();
 expect(c.sent).toHaveLength(1);expect(c.nodes.get('form-message').textContent).toContain('previous receipt is unconfirmed');
 c.fields.context='Fixture context';c.setMode('match');await c.submit();
 expect(c.sent).toHaveLength(2);expect(c.sent[1]).toEqual(first);expect(c.referenceCount()).toBe(1);
});
