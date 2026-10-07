const menu = document.querySelector('.menu-button');
const navigation = document.getElementById('navigation');
menu?.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); navigation.classList.toggle('open', open);});
navigation?.addEventListener('click', event => {if(event.target.closest('a')) {navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',event=>{if(event.key==='Escape' && navigation?.classList.contains('open')){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});

const form = document.getElementById('project-form');
if (form) {
 form.noValidate=true;
 const $ = id => document.getElementById(id);
 let step=0, busy=false, submitted=null, requestId=crypto.randomUUID(), requestPayload=null;
 const message=$('form-message');
 function valid(panel){for(const input of form.querySelectorAll(`[data-panel="${panel}"] input, [data-panel="${panel}"] textarea`)){if(!input.checkValidity()){input.reportValidity();return false;}}return true;}
 function show(n){step=n;form.querySelectorAll('[data-panel]').forEach(p=>p.hidden=Number(p.dataset.panel)!==n);document.querySelectorAll('[data-progress]').forEach(p=>{if(Number(p.dataset.progress)===n)p.setAttribute('aria-current','step');else p.removeAttribute('aria-current');});$('form-step').textContent=`STEP 0${n+1} OF 03`;$('form-back').hidden=n===0;$('form-next').hidden=n===2;$('form-send').hidden=n!==2;message.textContent='';if(n===2){const title=document.createElement('strong');title.textContent=$('business').value;const summary=document.createElement('span');summary.textContent=[$('website').value||'No website yet',...Array.from(form.querySelectorAll('[name=goals]:checked'),x=>x.value)].join(' · ');$('brief-summary').replaceChildren(title,summary);}const heading=form.querySelector(`[data-panel="${n}"] h2`);heading.tabIndex=-1;heading.focus();}
 $('form-next').addEventListener('click',()=>{if(valid(step))show(step+1);});
 $('form-back').addEventListener('click',()=>show(step-1));
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;if(step!==2){if(valid(step))show(step+1);return;}for(let i=0;i<3;i++){if(!valid(i)){show(i);return;}}
  const values=Object.fromEntries(new FormData(form));
  const goals=Array.from(form.querySelectorAll('[name=goals]:checked'),x=>x.value);
  const note=[`Business: ${values.business}`,`Website: ${values.website||'Not supplied'}`,`Offer: ${values.offering}`,`Goals: ${goals.join(', ')||'Discuss together'}`,`Context: ${values.context||'None'}`].join('\n');
  const current=JSON.stringify({name:values.name,email:values.email,note,lang:'en',consent:$('consent').checked===true,_hp:values._hp});
  if(requestPayload && current!==requestPayload)requestId=crypto.randomUUID();requestPayload=current;
  const payload={...JSON.parse(current),request_id:requestId};busy=true;form.querySelectorAll('button').forEach(b=>b.disabled=true);message.textContent='Sending your request…';
  try{const response=await fetch('https://intake.webcrawlers.tech/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});const result=await response.json().catch(()=>({}));if(!response.ok||result.ok!==true||result.reference!==requestId)throw new Error(result.error||'Your request could not be accepted.');submitted={...values,goals,requestId};form.hidden=true;$('form-success').hidden=false;$('sent-email').textContent=values.email;$('request-ref').textContent=`Your reference: ${requestId}`;$('form-success').focus();}
  catch(error){message.textContent=error.name==='TimeoutError'?'We could not confirm receipt. Your details are still here. Retry with the same reference, or email hello@webcrawlers.tech.':`${error.message||'Connection failed.'} Your details are still here. Try again or email hello@webcrawlers.tech.`;}
  finally{busy=false;form.querySelectorAll('button').forEach(b=>b.disabled=false);}
 });
 $('download-brief').addEventListener('click',()=>{if(!submitted)return;const text=`WebCrawlers project inquiry\nReference: ${submitted.requestId}\nBusiness: ${submitted.business}\nWebsite: ${submitted.website||'Not supplied'}\nOffer: ${submitted.offering}\nGoals: ${submitted.goals.join(', ')}\nNotes: ${submitted.context}\nContact: ${submitted.name}, ${submitted.email}\n\nNext step: Adam follows up to discuss scope and a quote. No work or payment was authorized.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='webcrawlers-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
