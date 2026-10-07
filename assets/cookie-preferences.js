(() => {
  'use strict';
  if (window.WebCrawlersPrivacy) return;

  const cookieName = 'webcrawlers_privacy';
  const policyRevision = '2026-10-07';
  const maxAgeSeconds = 180 * 24 * 60 * 60;
  const optionalStorageKey = 'webcrawlers-inquiry-entry-v1';
  const copy = {
    en: {
      title: 'Cookie and privacy choices', settings: 'Cookie settings',
      intro: 'We use one cookie to remember your choice. Optional enquiry context helps us understand where a request started. It stays in this tab for up to 30 minutes and is sent only with an enquiry.',
      none: 'Optional enquiry context is not configured here. Essential storage supports your sign-in session and remembers your privacy choice.',
      essential: 'Essential only', allow: 'Allow optional context', save: 'Save choices', close: 'Close settings', details: 'Cookie details',
      required: 'Essential storage', always: 'Always on', requiredText: 'Needed for the service you request, safe form retries and remembering this choice. Refusing optional context does not prevent an enquiry.',
      optional: 'Optional enquiry context', optionalText: 'A limited entry-page path, an allowlisted referring host and short campaign labels. No browsing transcripts or full referring URLs.',
      retention: 'Your choice lasts 180 days. You can change it here at any time. This choice does not subscribe you to marketing emails.',
      vendors: 'No third-party analytics or advertising cookies are loaded by this feature.',
      pending: 'Your earlier request may have arrived, but its receipt is unconfirmed. We did not send your changed request. Email hello@webcrawlers.tech with this reference:',
      notStored: 'Your browser did not save this choice. It applies to this page only.'
    },
    de: {
      title: 'Cookie- und Datenschutzauswahl', settings: 'Cookie-Einstellungen',
      intro: 'Ein Cookie merkt sich Ihre Auswahl. Optionaler Anfragekontext zeigt uns, wo eine Anfrage begann. Er bleibt bis zu 30 Minuten in diesem Tab und wird nur mit einer Anfrage gesendet.',
      none: 'Optionaler Anfragekontext ist hier nicht eingerichtet. Notwendiger Speicher unterstützt Ihre Anmeldung und merkt sich Ihre Datenschutzauswahl.',
      essential: 'Nur notwendige', allow: 'Optionalen Kontext erlauben', save: 'Auswahl speichern', close: 'Einstellungen schließen', details: 'Cookie-Details',
      required: 'Notwendiger Speicher', always: 'Immer aktiv', requiredText: 'Für den angefragten Dienst, sichere Formularwiederholungen und Ihre Auswahl erforderlich. Eine Anfrage ist auch ohne optionalen Kontext möglich.',
      optional: 'Optionaler Anfragekontext', optionalText: 'Ein begrenzter Einstiegspfad, ein freigegebener verweisender Host und kurze Kampagnenkennungen. Keine Gesprächsverläufe oder vollständigen verweisenden URLs.',
      retention: 'Ihre Auswahl gilt 180 Tage. Sie können sie hier jederzeit ändern. Sie melden sich damit nicht für Marketing-E-Mails an.',
      vendors: 'Diese Funktion lädt keine Analyse- oder Werbe-Cookies von Drittanbietern.',
      pending: 'Ihre frühere Anfrage könnte eingegangen sein, ist aber nicht bestätigt. Die geänderte Anfrage wurde nicht gesendet. Schreiben Sie an hello@webcrawlers.tech mit dieser Referenz:',
      notStored: 'Ihr Browser hat die Auswahl nicht gespeichert. Sie gilt nur für diese Seite.'
    },
    fr: {
      title: 'Choix des cookies et de confidentialité', settings: 'Paramètres des cookies',
      intro: 'Un cookie mémorise votre choix. Le contexte facultatif nous indique où une demande a commencé. Il reste dans cet onglet jusqu’à 30 minutes et est envoyé uniquement avec une demande.',
      none: 'Le contexte facultatif n’est pas configuré ici. Le stockage essentiel permet votre connexion et mémorise votre choix de confidentialité.',
      essential: 'Essentiels uniquement', allow: 'Autoriser le contexte facultatif', save: 'Enregistrer mes choix', close: 'Fermer les paramètres', details: 'Détails des cookies',
      required: 'Stockage essentiel', always: 'Toujours actif', requiredText: 'Nécessaire au service demandé, aux nouvelles tentatives du formulaire et à votre choix. Vous pouvez envoyer une demande sans contexte facultatif.',
      optional: 'Contexte facultatif de la demande', optionalText: 'Un chemin de page d’entrée limité, un site référent autorisé et de courts identifiants de campagne. Aucun historique de conversation ni URL de provenance complète.',
      retention: 'Votre choix reste valable 180 jours. Vous pouvez le modifier ici à tout moment. Ce choix ne vous inscrit pas à des emails marketing.',
      vendors: 'Cette fonction ne charge aucun cookie tiers d’analyse ou de publicité.',
      pending: 'Votre demande précédente a peut-être été reçue, mais sans confirmation. La demande modifiée n’a pas été envoyée. Écrivez à hello@webcrawlers.tech avec cette référence :',
      notStored: 'Votre navigateur n’a pas enregistré ce choix. Il s’applique uniquement à cette page.'
    },
    pl: {
      title: 'Wybór plików cookie i prywatności', settings: 'Ustawienia plików cookie',
      intro: 'Jeden plik cookie zapamiętuje Twój wybór. Opcjonalny kontekst pomaga ustalić, skąd pochodzi zapytanie. Pozostaje w tej karcie do 30 minut i jest wysyłany tylko z zapytaniem.',
      none: 'Opcjonalny kontekst zapytania nie jest tu skonfigurowany. Niezbędne dane wspierają logowanie i zapamiętują Twój wybór prywatności.',
      essential: 'Tylko niezbędne', allow: 'Zezwól na opcjonalny kontekst', save: 'Zapisz wybór', close: 'Zamknij ustawienia', details: 'Informacje o plikach cookie',
      required: 'Niezbędne dane', always: 'Zawsze aktywne', requiredText: 'Potrzebne do zamówionej usługi, bezpiecznych ponowień formularza i zapamiętania wyboru. Bez opcjonalnego kontekstu nadal możesz wysłać zapytanie.',
      optional: 'Opcjonalny kontekst zapytania', optionalText: 'Ograniczona ścieżka strony wejściowej, dozwolony host odsyłający i krótkie oznaczenia kampanii. Bez historii rozmów i pełnych adresów stron odsyłających.',
      retention: 'Twój wybór jest ważny przez 180 dni. Możesz go tu zmienić w dowolnej chwili. Ten wybór nie zapisuje Cię na wiadomości marketingowe.',
      vendors: 'Ta funkcja nie ładuje plików cookie zewnętrznej analityki ani reklam.',
      pending: 'Poprzednie zapytanie mogło dotrzeć, ale nie ma potwierdzenia. Zmienione zapytanie nie zostało wysłane. Napisz na hello@webcrawlers.tech i podaj ten numer:',
      notStored: 'Przeglądarka nie zapisała tego wyboru. Obowiązuje on tylko na tej stronie.'
    },
    sv: {
      title: 'Val för kakor och integritet', settings: 'Inställningar för kakor',
      intro: 'En kaka sparar ditt val. Valfri förfrågningskontext hjälper oss att se var en förfrågan började. Den stannar i den här fliken i upp till 30 minuter och skickas bara med en förfrågan.',
      none: 'Valfri förfrågningskontext är inte inställd här. Nödvändig lagring stöder din inloggning och sparar ditt integritetsval.',
      essential: 'Endast nödvändiga', allow: 'Tillåt valfri kontext', save: 'Spara val', close: 'Stäng inställningar', details: 'Information om kakor',
      required: 'Nödvändig lagring', always: 'Alltid aktiv', requiredText: 'Behövs för tjänsten du begär, säkra formulärförsök och ditt val. Du kan skicka en förfrågan utan valfri kontext.',
      optional: 'Valfri förfrågningskontext', optionalText: 'En begränsad sökväg till startsidan, en godkänd hänvisande värd och korta kampanjnamn. Inga samtalshistoriker eller fullständiga hänvisande webbadresser.',
      retention: 'Ditt val gäller i 180 dagar. Du kan ändra det här när som helst. Valet anmäler dig inte till marknadsföringsmejl.',
      vendors: 'Funktionen laddar inga analys- eller reklamkakor från tredje part.',
      pending: 'Din tidigare förfrågan kan ha kommit fram men saknar bekräftelse. Vi skickade inte den ändrade förfrågan. Mejla hello@webcrawlers.tech med denna referens:',
      notStored: 'Din webbläsare sparade inte valet. Det gäller bara på den här sidan.'
    },
    he: {
      title: 'בחירת עוגיות ופרטיות', settings: 'הגדרות עוגיות',
      intro: 'עוגייה אחת שומרת את הבחירה שלך. הקשר פנייה אופציונלי עוזר לנו להבין מאיפה התחילה הפנייה. הוא נשמר בלשונית הזו עד 30 דקות ונשלח רק יחד עם פנייה.',
      none: 'הקשר פנייה אופציונלי אינו מוגדר כאן. אחסון חיוני תומך בהתחברות ושומר את בחירת הפרטיות שלך.',
      essential: 'חיוניות בלבד', allow: 'לאפשר הקשר אופציונלי', save: 'שמירת הבחירה', close: 'סגירת ההגדרות', details: 'פרטים על עוגיות',
      required: 'אחסון חיוני', always: 'פעיל תמיד', requiredText: 'נדרש לשירות שביקשת, לניסיון חוזר של הטופס ולשמירת הבחירה. ניתן לשלוח פנייה גם בלי הקשר אופציונלי.',
      optional: 'הקשר פנייה אופציונלי', optionalText: 'נתיב מוגבל של דף הכניסה, אתר מפנה מרשימה מאושרת ותוויות קמפיין קצרות. בלי תמלילי שיחות ובלי כתובות מלאות של דפים מפנים.',
      retention: 'הבחירה נשמרת ל-180 ימים. אפשר לשנות אותה כאן בכל עת. הבחירה הזו אינה הרשמה לדיוור שיווקי.',
      vendors: 'תכונה זו אינה טוענת עוגיות ניתוח או פרסום של צד שלישי.',
      pending: 'ייתכן שהפנייה הקודמת התקבלה, אך אין אישור. הפנייה ששונתה לא נשלחה. יש לכתוב אל hello@webcrawlers.tech ולציין את המספר הזה:',
      notStored: 'הדפדפן לא שמר את הבחירה. היא חלה על הדף הזה בלבד.'
    }
  };
  const language = (document.documentElement.lang || 'en').split('-')[0];
  const words = copy[language] || copy.en;
  let volatileChoice = null;
  let inquiryEntryContext = null;
  let inquiryEntryCapturedAt = null;
  let banner, dialog, optionalInput, notice, returnFocus;

  function optionalAvailable() {
    return document.body?.dataset.privacyAttribution !== 'unavailable';
  }
  function clearOptionalContext() {
    try { sessionStorage.removeItem(optionalStorageKey); } catch {}
  }
  function validChoice(record) {
    const keys = ['schemaVersion', 'policyRevision', 'decidedAt', 'attribution'];
    return record && typeof record === 'object' && !Array.isArray(record) && Object.keys(record).length === keys.length
      && Object.keys(record).every(key => keys.includes(key)) && record.schemaVersion === 1 && record.policyRevision === policyRevision
      && typeof record.attribution === 'boolean' && Number.isFinite(record.decidedAt) && record.decidedAt <= Date.now()
      && Date.now() - record.decidedAt < maxAgeSeconds * 1000;
  }
  function readChoice() {
    try {
      const entry = document.cookie.split(';').map(item => item.trim()).find(item => item.startsWith(cookieName + '='));
      if (!entry) return null;
      const value = decodeURIComponent(entry.slice(cookieName.length + 1));
      if (value.length > 512) return null;
      const record = JSON.parse(value);
      return validChoice(record) ? record : null;
    } catch { return null; }
  }
  function currentChoice() {
    if (volatileChoice && !validChoice(volatileChoice)) volatileChoice = null;
    return volatileChoice || readChoice();
  }
  function getPreferences() {
    const record = currentChoice();
    const preferences = {essential: true, attribution: optionalAvailable() && record?.attribution === true};
    if (!preferences.attribution) {
      clearOptionalContext();
      inquiryEntryContext = null;
      inquiryEntryCapturedAt = null;
    }
    return preferences;
  }
  const inquiryPaths = /^\/(?:|start|ai-visibility-audit|ai-visibility-audit-pricing|example|about|service|privacy|cookies|how-it-works|faq|de\/|fr\/|pl\/|sv\/|he\/)$/;
  const referrerHosts = ['google.com', 'www.google.com', 'bing.com', 'www.bing.com', 'chatgpt.com', 'claude.ai', 'perplexity.ai', 'www.perplexity.ai'];
  const inquiryMaxAge = 30 * 60 * 1000;
  function captureInquiryEntry() {
    if (!getPreferences().attribution) return;
    const now = Date.now();
    const token = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value);
    const valid = value => value && typeof value === 'object' && !Array.isArray(value) && value.schemaVersion === 1
      && (value.landingPath === null || typeof value.landingPath === 'string' && inquiryPaths.test(value.landingPath))
      && Object.keys(value).every(key => ['schemaVersion', 'landingPath', 'utmSource', 'utmMedium', 'utmCampaign', 'referrerHost'].includes(key))
      && ['utmSource', 'utmMedium', 'utmCampaign'].every(key => value[key] === undefined || token(value[key]))
      && (value.referrerHost === undefined || referrerHosts.includes(value.referrerHost));
    try {
      const saved = sessionStorage.getItem(optionalStorageKey);
      if (saved !== null) {
        const record = saved.length <= 2048 ? JSON.parse(saved) : null;
        if (!record || Object.keys(record).some(key => !['capturedAt', 'context'].includes(key)) || !Number.isFinite(record.capturedAt)
          || record.capturedAt > now || now - record.capturedAt >= inquiryMaxAge || !valid(record.context)) {
          sessionStorage.setItem(optionalStorageKey, JSON.stringify({capturedAt: now, context: null}));
          return;
        }
        inquiryEntryContext = record.context;
        inquiryEntryCapturedAt = record.capturedAt;
        return;
      }
      const context = {schemaVersion: 1, landingPath: inquiryPaths.test(location.pathname) ? location.pathname : null};
      const query = new URLSearchParams(location.search);
      for (const [param, key] of [['utm_source', 'utmSource'], ['utm_medium', 'utmMedium'], ['utm_campaign', 'utmCampaign']]) {
        const values = query.getAll(param);
        if (values.length === 1 && token(values[0])) context[key] = values[0];
      }
      try {
        const referrer = new URL(document.referrer);
        if (['http:', 'https:'].includes(referrer.protocol) && referrerHosts.includes(referrer.hostname) && !referrer.username && !referrer.password) context.referrerHost = referrer.hostname;
      } catch {}
      sessionStorage.setItem(optionalStorageKey, JSON.stringify({capturedAt: now, context}));
      inquiryEntryContext = context;
      inquiryEntryCapturedAt = now;
    } catch {
      try { sessionStorage.setItem(optionalStorageKey, JSON.stringify({capturedAt: now, context: null})); } catch {}
    }
  }
  function getInquiryContext() {
    const unknown = {schemaVersion: 1, landingPath: null, formPath: inquiryPaths.test(location.pathname) ? location.pathname : null};
    if (!getPreferences().attribution) return unknown;
    if (!inquiryEntryContext || !Number.isFinite(inquiryEntryCapturedAt)) return unknown;
    if (Date.now() < inquiryEntryCapturedAt || Date.now() - inquiryEntryCapturedAt >= inquiryMaxAge) {
      clearOptionalContext();
      inquiryEntryContext = null;
      inquiryEntryCapturedAt = null;
      return unknown;
    }
    return {...inquiryEntryContext, formPath: unknown.formPath};
  }
  function hasChoice() { return Boolean(currentChoice()); }
  function closeSettings() {
    if (dialog?.open) dialog.close();
  }
  function setPreferences(choice = {}) {
    const record = {schemaVersion: 1, policyRevision, decidedAt: Date.now(), attribution: optionalAvailable() && choice?.attribution === true};
    let saved = false;
    try {
      document.cookie = cookieName + '=' + encodeURIComponent(JSON.stringify(record)) + '; Path=/; Max-Age=' + maxAgeSeconds + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
      const stored = readChoice();
      saved = stored?.decidedAt === record.decidedAt && stored.attribution === record.attribution;
    } catch {}
    volatileChoice = saved ? null : record;
    if (!record.attribution) clearOptionalContext();
    inquiryEntryContext = null;
    inquiryEntryCapturedAt = null;
    if (record.attribution) captureInquiryEntry();
    if (banner) banner.hidden = true;
    if (notice) {
      notice.hidden = saved;
      notice.textContent = saved ? '' : words.notStored;
    }
    closeSettings();
    document.dispatchEvent(new CustomEvent('webcrawlers:privacy-change', {detail: {...getPreferences(), policyRevision, saved}}));
    return getPreferences();
  }
  function openSettings() {
    if (!dialog) buildInterface();
    if (!dialog || dialog.open) return;
    if (optionalInput) optionalInput.checked = getPreferences().attribution;
    returnFocus = document.activeElement;
    dialog.showModal();
    dialog.querySelector('h2').focus();
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function button(text, action) {
    const node = element('button', 'wc-privacy-button', text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function detailsLink() {
    const node = element('a', 'wc-privacy-details', words.details);
    node.href = '/cookies';
    return node;
  }
  function buildInterface() {
    if (!document.body || dialog) return;
    const available = optionalAvailable();
    getPreferences();
    notice = element('p', 'wc-privacy-notice');
    notice.setAttribute('role', 'status');
    notice.hidden = true;
    document.body.append(notice);

    dialog = element('dialog', 'wc-privacy-dialog');
    dialog.id = 'wc-privacy-settings';
    dialog.setAttribute('aria-labelledby', 'wc-privacy-settings-title');
    dialog.setAttribute('aria-describedby', 'wc-privacy-settings-intro');
    const title = element('h2', '', words.settings);
    title.id = 'wc-privacy-settings-title';
    title.tabIndex = -1;
    const intro = element('p', '', available ? words.intro : words.none);
    intro.id = 'wc-privacy-settings-intro';
    const required = element('section', 'wc-privacy-row');
    required.append(element('h3', '', words.required), element('span', 'wc-privacy-always', words.always), element('p', '', words.requiredText));
    dialog.append(title, intro, required);
    if (available) {
      const row = element('div', 'wc-privacy-row');
      const label = element('label', 'wc-privacy-option');
      optionalInput = document.createElement('input');
      optionalInput.type = 'checkbox';
      optionalInput.id = 'wc-privacy-attribution';
      optionalInput.setAttribute('aria-describedby', 'wc-privacy-attribution-description');
      label.append(optionalInput, element('span', '', words.optional));
      const description = element('p', '', words.optionalText);
      description.id = 'wc-privacy-attribution-description';
      row.append(label, description);
      dialog.append(row);
    }
    const actions = element('div', 'wc-privacy-actions');
    actions.append(button(words.essential, () => setPreferences({attribution: false})));
    if (available) actions.append(button(words.save, () => setPreferences({attribution: optionalInput.checked})));
    dialog.append(element('p', 'wc-privacy-small', words.vendors), element('p', 'wc-privacy-small', words.retention), actions, detailsLink(), button(words.close, closeSettings));
    dialog.addEventListener('close', () => {
      const target = returnFocus?.isConnected && !returnFocus.closest('[hidden]') ? returnFocus : document.querySelector('[data-cookie-settings]');
      target?.focus();
    });
    document.body.append(dialog);

    if (available) {
      banner = element('section', 'wc-privacy-banner');
      banner.setAttribute('role', 'region');
      banner.setAttribute('aria-labelledby', 'wc-privacy-banner-title');
      banner.hidden = hasChoice();
      const text = element('div', 'wc-privacy-banner-copy');
      const heading = element('h2', '', words.title);
      heading.id = 'wc-privacy-banner-title';
      text.append(heading, element('p', '', words.intro), detailsLink());
      const choices = element('div', 'wc-privacy-actions');
      choices.append(button(words.essential, () => setPreferences({attribution: false})), button(words.settings, openSettings), button(words.allow, () => setPreferences({attribution: true})));
      banner.append(text, choices);
      document.body.append(banner);
    }
    document.addEventListener('click', event => {
      const control = event.target.closest?.('[data-cookie-settings]');
      if (control) { event.preventDefault(); openSettings(); }
    });
  }

  window.WebCrawlersPrivacy = Object.freeze({cookieName, policyRevision, getPreferences, getInquiryContext, pendingReceiptMessage: reference => words.pending + ' ' + reference, hasChoice, allows: purpose => purpose === 'essential' || purpose === 'attribution' && getPreferences().attribution, openSettings, setPreferences});
  // No optional data is read before this check, including context saved by an older page.
  getPreferences();
  captureInquiryEntry();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildInterface, {once: true});
  else buildInterface();
  window.addEventListener('pageshow', () => {
    getPreferences();
    if (banner) banner.hidden = hasChoice();
  });
})();
