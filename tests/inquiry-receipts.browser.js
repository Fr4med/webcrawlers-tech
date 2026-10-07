// Execute this function with the existing Playwright MCP browser_run_code tool.
// Start the static preview on 127.0.0.1:4967. Every submission is intercepted.
async (page) => {
  const base='http://127.0.0.1:4967';
  const endpoint='https://intake.webcrawlers.tech/lead';
  const checks=[],requests=[],blocked=[];
  let reply='missing';
  const check=(condition,label)=>{if(!condition)throw new Error(label);checks.push(label);};
  const guard=route=>route.request().url().startsWith(base+'/')?route.continue():(blocked.push(route.request().url()),route.abort());
  const respond=route=>{const data=route.request().postDataJSON();requests.push(data);check(data.attribution?.schemaVersion===1 && data.attribution.utmSource==='qa' && data.attribution.utmMedium==='local' && data.attribution.utmCampaign==='P04','bounded source fields survive browser serialization');check(!JSON.stringify(data.attribution).includes('secret') && !JSON.stringify(data.attribution).includes('private_chat'),'private query and fragment excluded');return route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({ok:true,...(reply==='missing'?{}:{reference:reply==='match'?data.request_id:'00000000-0000-4000-8000-000000000000'})})});};
  await page.route('**/*',guard);await page.route(endpoint,respond);
  try {
    await page.setViewportSize({width:390,height:844});
    for(const lang of ['de','fr','pl','sv','he']){
      await page.goto(`${base}/${lang}/?utm_source=qa&utm_medium=local&utm_campaign=P04&private_chat=secret#private`);
      await page.locator('#lead-name').fill('Synthetic receipt QA');
      await page.locator('#lead-email').fill('receipt-qa@example.test');
      await page.locator('#lead-note').fill('Local intercepted test only.');
      await page.locator('#lead-consent').check();
      let retryId;
      for(const mode of ['missing','mismatch','match']){
        reply=mode;await page.locator('#lead-form button[type=submit]').click();
        await page.waitForFunction(()=>!document.querySelector('#lead-form').hasAttribute('aria-busy'));
        const sent=requests.at(-1);retryId??=sent.request_id;
        check(sent.request_id===retryId,`${lang}/${mode}: unchanged retry retains reference`);
        check(await page.locator('#lead-msg').getAttribute('class')===(mode==='match'?'ok':'err'),`${lang}/${mode}: only matching receipt confirms acceptance`);
        check(await page.locator('#lead-email').inputValue()==='receipt-qa@example.test',`${lang}/${mode}: input remains available`);
      }
    }
    await page.goto(base+'/start?utm_source=qa&utm_medium=local&utm_campaign=P04&private_chat=secret#private');
    await page.locator('#business').fill('Synthetic receipt QA');
    await page.locator('#offering').fill('Local intercepted tests');await page.locator('#form-next').click();
    await page.locator('#form-next').click();await page.locator('#name').fill('Synthetic owner');
    await page.locator('#email').fill('receipt-qa@example.test');await page.locator('#consent').check();
    let retryId;
    for(const mode of ['missing','mismatch','match']){
      reply=mode;await page.locator('#form-send').click();
      await page.waitForFunction(()=>!document.querySelector('#project-form').hasAttribute('aria-busy'));
      retryId??=requests.at(-1).request_id;
      check(requests.at(-1).request_id===retryId,`en/${mode}: unchanged retry retains reference`);
      check(await page.locator('#form-success').isVisible()===(mode==='match'),`en/${mode}: only matching receipt confirms acceptance`);
      if(mode!=='match')check(await page.locator('#email').inputValue()==='receipt-qa@example.test',`en/${mode}: input remains available`);
    }
    check(blocked.length===0,'No unexpected external requests');
    return {passed:checks.length,checks,mockedSubmissions:requests.length,liveSubmissions:0,blocked};
  } finally {await page.unroute(endpoint,respond);await page.unroute('**/*',guard);}
}
