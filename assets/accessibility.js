// First-party display preferences. No network calls or analytics.
(() => {
 'use strict';
 const key='webcrawlers_accessibility_v1';
 const language=document.documentElement.lang.split('-')[0];
 const labels={
  en:['Accessibility','Display preferences','Text size','Default','High contrast','Underline links','Reduce motion','Reset preferences','Close','Accessibility statement','Saved on this device only. Browser zoom also works.'],
  he:['נגישות','העדפות תצוגה','גודל טקסט','ברירת מחדל','ניגודיות גבוהה','קו תחתון לקישורים','הפחתת תנועה','איפוס העדפות','סגירה','הצהרת נגישות','נשמר במכשיר זה בלבד. אפשר גם להשתמש בזום הדפדפן.'],
  de:['Barrierefreiheit','Anzeigeeinstellungen','Textgröße','Standard','Hoher Kontrast','Links unterstreichen','Bewegung reduzieren','Zurücksetzen','Schließen','Erklärung zur Barrierefreiheit','Nur auf diesem Gerät gespeichert. Der Browser-Zoom funktioniert ebenfalls.'],
  fr:['Accessibilité','Préférences d’affichage','Taille du texte','Par défaut','Contraste élevé','Souligner les liens','Réduire les animations','Réinitialiser','Fermer','Déclaration d’accessibilité','Enregistré sur cet appareil uniquement. Le zoom du navigateur fonctionne aussi.'],
  pl:['Dostępność','Ustawienia wyświetlania','Rozmiar tekstu','Domyślny','Wysoki kontrast','Podkreśl linki','Ogranicz ruch','Resetuj ustawienia','Zamknij','Deklaracja dostępności','Zapisane tylko na tym urządzeniu. Można też używać powiększenia przeglądarki.'],
  sv:['Tillgänglighet','Visningsinställningar','Textstorlek','Standard','Hög kontrast','Stryk under länkar','Minska rörelse','Återställ','Stäng','Tillgänglighetsinformation','Sparas bara på den här enheten. Webbläsarens zoom fungerar också.']
 };
 const t=labels[language]||labels.en;
 const defaults=()=>({size:100,contrast:false,links:false,motion:false});
 let state=defaults();
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&typeof saved==='object')state={size:[100,125,150,200].includes(saved.size)?saved.size:100,contrast:saved.contrast===true,links:saved.links===true,motion:saved.motion===true};}catch{}
 const root=document.documentElement;
 // Existing site typography uses px. Store each current computed size before
 // applying a multiplier; remeasure on viewport changes, not cumulatively.
 let scaled=[];
 const clearText=()=>{for(const item of scaled){if(item.value)item.el.style.setProperty('font-size',item.value,item.priority);else item.el.style.removeProperty('font-size');}scaled=[];};
 function scaleText(){
  clearText();if(state.size===100)return;
  const nodes=[...document.querySelectorAll('body,body *')].filter(el=>!el.closest('svg,script,style')&&el.getClientRects().length&&(el.matches('input,textarea,select,button')||[...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())));
  const sizes=nodes.map(el=>({el,value:el.style.getPropertyValue('font-size'),priority:el.style.getPropertyPriority('font-size'),px:parseFloat(getComputedStyle(el).fontSize)}));
  for(const item of sizes)item.el.style.setProperty('font-size',`${item.px*state.size/100}px`,'important');scaled=sizes;
 }
 function apply(){root.classList.toggle('wc-high-contrast',state.contrast);root.classList.toggle('wc-underline-links',state.links);root.classList.toggle('wc-reduce-motion',state.motion);root.classList.toggle('wc-large-text',state.size>100);scaleText();}
 function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}apply();}
 const button=document.createElement('button');button.type='button';button.className='wc-accessibility-launcher';button.setAttribute('aria-label',t[0]);button.title=t[0];button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','wc-accessibility-dialog');
 button.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M4 8.5 12 10l8-1.5M12 10v5m0 0-4 6m4-6 4 6"/></svg>';
 const dialog=document.createElement('dialog');dialog.id='wc-accessibility-dialog';dialog.className='wc-accessibility-dialog';dialog.setAttribute('aria-labelledby','wc-accessibility-title');
 const h=document.createElement('h2');h.id='wc-accessibility-title';h.textContent=t[1];dialog.append(h);
 const sizeLabel=document.createElement('label');sizeLabel.htmlFor='wc-text-size';sizeLabel.textContent=t[2];
 const size=document.createElement('select');size.id='wc-text-size';for(const v of [100,125,150,200]){const o=document.createElement('option');o.value=String(v);o.textContent=v===100?`${t[3]} (100%)`:`${v}%`;size.append(o);}dialog.append(sizeLabel,size);
 const controls={};for(const [field,index] of [['contrast',4],['links',5],['motion',6]]){const label=document.createElement('label');label.className='wc-accessibility-option';const input=document.createElement('input');input.type='checkbox';input.checked=state[field];const span=document.createElement('span');span.textContent=t[index];label.append(input,span);dialog.append(label);controls[field]=input;input.addEventListener('change',()=>{state[field]=input.checked;save();});}
 const note=document.createElement('p');note.className='wc-accessibility-note';note.textContent=t[10];dialog.append(note);
 const statement=document.createElement('a');statement.href='/accessibility';statement.textContent=t[9];dialog.append(statement);
 const actions=document.createElement('div');actions.className='wc-accessibility-actions';const reset=document.createElement('button');reset.type='button';reset.textContent=t[7];const close=document.createElement('button');close.type='button';close.textContent=t[8];actions.append(reset,close);dialog.append(actions);
 document.body.append(button,dialog);
 const sync=()=>{size.value=String(state.size);for(const [field,input] of Object.entries(controls))input.checked=state[field];};sync();apply();
 button.addEventListener('click',()=>{if(typeof dialog.showModal!=='function'){location.assign('/accessibility');return;}dialog.showModal();scaleText();size.focus();});
 dialog.addEventListener('close',()=>{button.focus();scaleText();});close.addEventListener('click',()=>dialog.close());
 reset.addEventListener('click',()=>{state=defaults();sync();try{localStorage.removeItem(key);}catch{}apply();});
 size.addEventListener('change',()=>{state.size=Number(size.value);save();});
 let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{scaleText();positionButton();},150);});
 function positionButton(){const banner=document.querySelector('.wc-privacy-banner');const visible=banner&&!banner.hidden&&getComputedStyle(banner).position==='fixed';root.style.setProperty('--wc-consent-offset',visible?`${banner.getBoundingClientRect().height+32}px`:'0px');}
 function observeBanner(){const banner=document.querySelector('.wc-privacy-banner');if(banner){new ResizeObserver(positionButton).observe(banner);new MutationObserver(positionButton).observe(banner,{attributes:true,attributeFilter:['hidden','class']});}positionButton();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeBanner,{once:true});else observeBanner();
 // Persistent inline error text complements native validation messages.
 for(const form of document.forms){
  form.addEventListener('invalid',event=>{const input=event.target;if(!input.id||input.name==='_hp')return;const id=`wc-error-${input.id}`;let error=document.getElementById(id);if(!error){error=document.createElement('p');error.id=id;error.className='wc-field-error';error.setAttribute('role','alert');(input.closest('label')||input).insertAdjacentElement('afterend',error);}error.textContent=input.validationMessage;error.hidden=false;input.setAttribute('aria-invalid','true');const ids=new Set((input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add(id);input.setAttribute('aria-describedby',[...ids].join(' '));},true);
  form.addEventListener('input',event=>{const input=event.target;if(!input.id||!input.validity?.valid)return;input.removeAttribute('aria-invalid');const error=document.getElementById(`wc-error-${input.id}`);if(error){error.hidden=true;error.textContent='';}});
  form.addEventListener('click',event=>{if(event.target.closest('[id="form-next"],[id="form-back"],[id="edit-brief"]'))queueMicrotask(scaleText);});
 }
})();
