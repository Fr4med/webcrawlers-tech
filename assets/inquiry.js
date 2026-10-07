// Optional source context is owned by the shared, default-off privacy control.
function inquiryAttribution() {
  return window.WebCrawlersPrivacy?.getInquiryContext() || {schemaVersion: 1, landingPath: null, formPath: null};
}
const form = document.getElementById('lead-form');
if (form) {
  const message = document.getElementById('lead-msg');
  const reference = document.getElementById('lead-reference');
  const button = form.querySelector('button[type="submit"]');
  let busy = false;
  let awaitingReceipt = false;
  let requestId = crypto.randomUUID();
  let previousPayload = null;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    if (!form.reportValidity()) {
      message.className = 'err';
      message.textContent = form.dataset.invalid;
      return;
    }
    const fields = Object.fromEntries(new FormData(form));
    const data = {
      name: String(fields.name ?? '').trim(),
      email: String(fields.email ?? '').trim(),
      note: String(fields.note ?? '').trim(),
      lang: document.documentElement.lang,
      consent: fields.consent === 'on',
      _hp: String(fields._hp ?? ''),
      attribution: inquiryAttribution(),
    };
    const serialized = JSON.stringify(data);
    if (awaitingReceipt && previousPayload !== null && previousPayload !== serialized) {
      message.className = 'err';
      message.textContent = window.WebCrawlersPrivacy?.pendingReceiptMessage(requestId) || `Your previous receipt is unconfirmed. Your changed request was not sent. Email hello@webcrawlers.tech with reference ${requestId}.`;
      reference.textContent = `${form.dataset.reference}: ${requestId}`;
      return;
    }
    if (previousPayload !== null && previousPayload !== serialized) requestId = crypto.randomUUID();
    previousPayload = serialized;
    busy = true;
    awaitingReceipt = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    message.className = '';
    message.textContent = form.dataset.sending;
    reference.textContent = `${form.dataset.reference}: ${requestId}`;
    try {
      const response = await fetch('https://intake.webcrawlers.tech/lead', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...data, request_id: requestId}),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true || result.reference !== requestId) throw new Error('Receipt unconfirmed');
      awaitingReceipt = false;
      message.className = 'ok';
      message.textContent = form.dataset.received;
    } catch {
      message.className = 'err';
      message.textContent = form.dataset.retry;
    } finally {
      busy = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
}
