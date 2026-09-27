import { writeFileSync } from 'node:fs';

const copy = {
  de: {
    title: 'WebCrawlers — Pilotprojekt zur Verbesserung Ihrer Website',
    description: 'Ein betreutes Pilotprojekt für kleine Websites: bis zu 30 Seiten prüfen, Änderungen vereinbaren und Ergebnisse vor und nach der Umsetzung ansehen.',
    navHow: 'So funktioniert es', navPricing: 'Preise', navFaq: 'FAQ', navContact: 'Pilotprojekt besprechen',
    eyebrow: 'Betreutes Pilotprojekt für kleine Unternehmen', headline: 'Finden, was Ihre Website bremst.', emphasis: 'Das Wichtigste zuerst beheben.',
    intro: 'Wir prüfen, wie Ihre Seiten für Suche und KI-gestützte Recherche funktionieren. Adam bespricht die Ergebnisse mit Ihnen und setzt nur vereinbarte Änderungen um.',
    scopeTitle: 'Was das Pilotprojekt umfasst', scope: ['Eine aktive Website, eine Sprache und bis zu 30 vereinbarte Seiten', 'Technische Prüfung und ein Bericht mit Prioritäten', 'Bis zu drei vereinbarte technische Korrekturen und eine klarere Formulierung auf einer bestehenden Seite', 'Freigabe vor Veröffentlichung, Prüfung der Live-Seiten und Nachkontrolle nach 30 Tagen'],
    pricingTitle: 'Zwei getrennte Positionen im Angebot', pricing: 'Die einmalige Einrichtung mit Adam und die Umsetzung werden getrennt angeboten. Wir nennen den Preis, nachdem wir die Website und den Umfang geprüft haben. Es gibt kein Abo oder kostenloses 30-Tage-Testangebot.',
    limit: 'Wir garantieren keine Rankings, Erwähnungen durch KI, Besucherzahlen oder Verkäufe. Änderungen werden nicht automatisch veröffentlicht.',
    contactTitle: 'Erzählen Sie uns von Ihrer Website', contact: 'Senden Sie die URL und Ihr wichtigstes Anliegen. Adam antwortet per E-Mail und bespricht Umfang und Preis.',
    name: 'Name oder Firma *', email: 'E-Mail *', note: 'Website und Ihr Anliegen', send: 'Pilotprojekt besprechen', sending: 'Wird gesendet…', sent: 'Vielen Dank. Wir antworten per E-Mail.', error: 'Senden fehlgeschlagen. Schreiben Sie bitte an hello@webcrawlers.tech.', invalid: 'Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse ein.', prefer: 'Lieber per E-Mail?'
  },
  fr: {
    title: 'WebCrawlers — Projet pilote pour améliorer votre site',
    description: 'Un projet pilote accompagné pour les petits sites : examiner jusqu’à 30 pages, convenir des corrections et vérifier le résultat.',
    navHow: 'Fonctionnement', navPricing: 'Tarifs', navFaq: 'FAQ', navContact: 'Discuter du pilote',
    eyebrow: 'Projet pilote accompagné pour petites entreprises', headline: 'Repérez ce qui freine votre site.', emphasis: 'Corrigez l’essentiel d’abord.',
    intro: 'Nous examinons l’accès à vos pages et leur clarté pour la recherche et les outils d’IA. Adam passe les résultats en revue avec vous et n’applique que les changements convenus.',
    scopeTitle: 'Ce que comprend le pilote', scope: ['Un site en ligne, une langue et jusqu’à 30 pages convenues', 'Un contrôle technique et un rapport classé par priorité', 'Jusqu’à trois corrections techniques convenues et une amélioration de clarté sur une page existante', 'Votre accord avant publication, la vérification du site en ligne et un suivi après 30 jours'],
    pricingTitle: 'Deux postes distincts dans le devis', pricing: 'La mise en place avec Adam et le travail de correction sont chiffrés séparément après examen du site. Ce pilote n’est ni un abonnement ni un essai gratuit de 30 jours.',
    limit: 'Nous ne garantissons ni classement, ni mention par une IA, ni trafic, ni ventes. Aucun changement n’est publié automatiquement.',
    contactTitle: 'Parlez-nous de votre site', contact: 'Envoyez son adresse et votre principal objectif. Adam répondra par e-mail pour discuter du périmètre et du prix.',
    name: 'Nom ou entreprise *', email: 'E-mail *', note: 'Votre site et votre demande', send: 'Discuter du pilote', sending: 'Envoi…', sent: 'Merci. Nous vous répondrons par e-mail.', error: 'Envoi impossible. Écrivez à hello@webcrawlers.tech.', invalid: 'Indiquez votre nom et une adresse e-mail valide.', prefer: 'Vous préférez un e-mail ?'
  },
  pl: {
    title: 'WebCrawlers — Pilotaż usprawnienia witryny',
    description: 'Pilotaż dla małych witryn: analiza do 30 stron, uzgodnione poprawki i sprawdzenie efektu.',
    navHow: 'Jak to działa', navPricing: 'Ceny', navFaq: 'FAQ', navContact: 'Porozmawiajmy o pilotażu',
    eyebrow: 'Pilotaż prowadzony przez założyciela', headline: 'Sprawdź, co utrudnia działanie Twojej witryny.', emphasis: 'Napraw najważniejsze problemy.',
    intro: 'Sprawdzamy dostępność i czytelność stron dla wyszukiwarek oraz narzędzi AI. Adam omawia wyniki i wdraża tylko uzgodnione zmiany.',
    scopeTitle: 'Zakres pilotażu', scope: ['Jedna działająca witryna, jeden język i do 30 uzgodnionych stron', 'Kontrola techniczna i raport z priorytetami', 'Do trzech uzgodnionych poprawek technicznych i jedna poprawa jasności istniejącej strony', 'Twoja zgoda przed publikacją, weryfikacja witryny i kontrola po 30 dniach'],
    pricingTitle: 'Dwie osobne pozycje w wycenie', pricing: 'Jednorazowe przygotowanie z Adamem i prace naprawcze wyceniamy osobno po obejrzeniu witryny. Pilotaż nie jest abonamentem ani 30-dniowym darmowym okresem próbnym.',
    limit: 'Nie gwarantujemy pozycji w wynikach, wzmianek w AI, ruchu ani sprzedaży. Zmiany nie są publikowane automatycznie.',
    contactTitle: 'Opowiedz nam o swojej witrynie', contact: 'Wyślij adres witryny i główny problem. Adam odpowie e-mailem, aby omówić zakres i cenę.',
    name: 'Imię lub firma *', email: 'E-mail *', note: 'Witryna i Twój cel', send: 'Porozmawiajmy o pilotażu', sending: 'Wysyłanie…', sent: 'Dziękujemy. Odpowiemy e-mailem.', error: 'Nie udało się wysłać. Napisz na hello@webcrawlers.tech.', invalid: 'Podaj imię i poprawny adres e-mail.', prefer: 'Wolisz e-mail?'
  },
  sv: {
    title: 'WebCrawlers — Pilotprojekt för en bättre webbplats',
    description: 'Ett personligt pilotprojekt för små webbplatser: granska upp till 30 sidor, kom överens om ändringar och kontrollera resultatet.',
    navHow: 'Så fungerar det', navPricing: 'Pris', navFaq: 'FAQ', navContact: 'Prata om ett pilotprojekt',
    eyebrow: 'Personligt pilotprojekt för små företag', headline: 'Se vad som håller tillbaka din webbplats.', emphasis: 'Åtgärda det viktigaste först.',
    intro: 'Vi granskar hur sidorna fungerar för sök och AI-stödd informationssökning. Adam går igenom resultaten med dig och genomför bara överenskomna ändringar.',
    scopeTitle: 'Det här ingår', scope: ['En aktiv webbplats, ett språk och upp till 30 överenskomna sidor', 'Teknisk granskning och en prioriterad rapport', 'Upp till tre överenskomna tekniska åtgärder och en tydligare text på en befintlig sida', 'Ditt godkännande före publicering, kontroll av den aktiva webbplatsen och uppföljning efter 30 dagar'],
    pricingTitle: 'Två separata delar i offerten', pricing: 'Engångsstarten med Adam och arbetet med åtgärder prissätts var för sig efter att vi granskat webbplatsen. Piloten är ingen prenumeration eller gratis 30-dagarsperiod.',
    limit: 'Vi garanterar inte placeringar, omnämnanden av AI, trafik eller försäljning. Inga ändringar publiceras automatiskt.',
    contactTitle: 'Berätta om din webbplats', contact: 'Skicka webbadressen och ditt viktigaste mål. Adam svarar via e-post för att diskutera omfattning och pris.',
    name: 'Namn eller företag *', email: 'E-post *', note: 'Webbplats och önskemål', send: 'Prata om ett pilotprojekt', sending: 'Skickar…', sent: 'Tack. Vi svarar via e-post.', error: 'Det gick inte att skicka. Skriv till hello@webcrawlers.tech.', invalid: 'Ange namn och en giltig e-postadress.', prefer: 'Föredrar du e-post?'
  },
  he: {
    title: 'WebCrawlers — פיילוט לשיפור האתר',
    description: 'פיילוט מלווה לעסקים קטנים: בדיקה של עד 30 עמודים, תיקונים מוסכמים ובדיקת התוצאה באתר הפעיל.',
    navHow: 'איך זה עובד', navPricing: 'תמחור', navFaq: 'שאלות נפוצות', navContact: 'לדבר על הפיילוט',
    eyebrow: 'פיילוט בליווי אישי לעסקים קטנים', headline: 'לגלות מה מקשה על האתר שלכם.', emphasis: 'לתקן קודם את מה שחשוב.',
    intro: 'אנחנו בודקים את נגישות ובהירות העמודים לחיפוש ולכלי AI. אדם עובר איתכם על הממצאים ומבצע רק שינויים שסוכמו.',
    scopeTitle: 'מה כולל הפיילוט', scope: ['אתר פעיל אחד, שפה אחת ועד 30 עמודים מוסכמים', 'בדיקה טכנית ודוח עם סדר עדיפויות', 'עד שלושה תיקונים טכניים מוסכמים ושיפור בהירות בעמוד קיים אחד', 'אישור שלכם לפני פרסום, בדיקת האתר הפעיל ומעקב אחרי 30 יום'],
    pricingTitle: 'שני סעיפים נפרדים בהצעת המחיר', pricing: 'ההקמה החד-פעמית עם אדם ועבודת התיקון מתומחרות בנפרד לאחר בדיקת האתר. הפיילוט אינו מנוי ואינו ניסיון חינם ל-30 יום.',
    limit: 'אין הבטחה לדירוגים, לאזכורים בכלי AI, לתנועה או למכירות. שינויים אינם מתפרסמים אוטומטית.',
    contactTitle: 'ספרו לנו על האתר', contact: 'שלחו את כתובת האתר ואת הנושא החשוב לכם. אדם יחזור אליכם בדוא״ל כדי לדון בהיקף ובמחיר.',
    name: 'שם או חברה *', email: 'דוא״ל *', note: 'כתובת האתר ומה תרצו לשפר', send: 'לדבר על הפיילוט', sending: 'שולחים…', sent: 'תודה. נחזור אליכם בדוא״ל.', error: 'השליחה נכשלה. כתבו ל-hello@webcrawlers.tech.', invalid: 'נא להזין שם וכתובת דוא״ל תקינה.', prefer: 'מעדיפים דוא״ל?'
  }
};

const languages = [['en', '/', 'EN'], ['he', '/he/', 'עב'], ['de', '/de/', 'DE'], ['fr', '/fr/', 'FR'], ['pl', '/pl/', 'PL'], ['sv', '/sv/', 'SV']];
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

for (const [lang, t] of Object.entries(copy)) {
  const navLangs = languages.map(([code, href, label]) => `<a href="${href}" lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const html = `<!doctype html>
<html lang="${lang}"${lang === 'he' ? ' dir="rtl"' : ''}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(t.title)}</title>
<meta name="description" content="${escape(t.description)}">
<link rel="canonical" href="https://webcrawlers.tech/${lang}/">
${languages.map(([code, href]) => `<link rel="alternate" hreflang="${code}" href="https://webcrawlers.tech${href}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="https://webcrawlers.tech/">
<link rel="icon" type="image/png" href="/assets/logo.png">
<link rel="stylesheet" href="/assets/site.css">
<meta property="og:type" content="website"><meta property="og:url" content="https://webcrawlers.tech/${lang}/"><meta property="og:title" content="${escape(t.title)}"><meta property="og:description" content="${escape(t.description)}"><meta property="og:image" content="https://webcrawlers.tech/assets/hero.png">
</head>
<body>
<nav><div class="wrap"><a class="brand" href="/"><img src="/assets/logo.png" alt="" width="28" height="28">WebCrawlers</a><span class="links"><a href="/how-it-works">${t.navHow}</a><a href="#pricing">${t.navPricing}</a><a href="/faq">${t.navFaq}</a><span class="langs" aria-label="Language">${navLangs}</span><a href="#audit" class="btn ghost">${t.navContact}</a></span></div></nav>
<header class="hero"><div class="wrap"><span class="eyebrow">${t.eyebrow}</span><h1>${t.headline} <em>${t.emphasis}</em></h1><p class="sub">${t.intro}</p><div class="cta-row"><a class="btn" href="#audit">${t.navContact}</a><a class="btn ghost" href="/how-it-works">${t.navHow}</a></div><p class="trust">${t.limit}</p></div></header>
<section><div class="wrap"><h2>${t.scopeTitle}</h2><div class="grid">${t.scope.map((item) => `<div class="card"><p>${item}</p></div>`).join('')}</div></div></section>
<section class="alt" id="pricing"><div class="wrap"><h2>${t.pricingTitle}</h2><p class="lede">${t.pricing}</p><a class="btn" href="#audit">${t.navContact}</a></div></section>
<section id="audit"><div class="wrap contact-layout"><div><h2>${t.contactTitle}</h2><p class="lede">${t.contact}</p></div><form class="contact-panel" id="lead-form" novalidate><label for="lead-name">${t.name}</label><input id="lead-name" name="name" required maxlength="120"><label for="lead-email">${t.email}</label><input id="lead-email" name="email" type="email" required maxlength="200"><label for="lead-note">${t.note}</label><textarea id="lead-note" name="note" maxlength="1000"></textarea><input class="hp" name="_hp" tabindex="-1" autocomplete="off" aria-hidden="true"><div style="margin-top:20px"><button class="btn" type="submit">${t.send}</button></div><p id="lead-msg" role="status"></p><p>${t.prefer} <a href="mailto:hello@webcrawlers.tech">hello@webcrawlers.tech</a></p></form></div></section>
<footer><div class="wrap"><span>© 2026 WebCrawlers · webcrawlers.tech</span><span class="fl"><a href="/">EN</a><a href="/how-it-works">${t.navHow}</a><a href="/faq">${t.navFaq}</a><a href="mailto:hello@webcrawlers.tech">hello@webcrawlers.tech</a></span></div></footer>
<script>
const form = document.getElementById('lead-form'); const msg = document.getElementById('lead-msg');
form.addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(form).entries()); data.lang = document.documentElement.lang; if (!String(data.name ?? '').trim() || !document.getElementById('lead-email').validity.valid) { msg.className = 'err'; msg.textContent = ${JSON.stringify(t.invalid)}; return; } msg.className = ''; msg.textContent = ${JSON.stringify(t.sending)}; try { const response = await fetch('https://webcrawlers-leads.adamkrestol.workers.dev/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) }); const out = await response.json().catch(() => ({})); if (response.ok && out.ok) { msg.className = 'ok'; msg.textContent = ${JSON.stringify(t.sent)}; form.reset(); } else { msg.className = 'err'; msg.textContent = out.error || ${JSON.stringify(t.error)}; } } catch { msg.className = 'err'; msg.textContent = ${JSON.stringify(t.error)}; } });
</script>
</body>
</html>
`;
  writeFileSync(new URL(`./${lang}/index.html`, import.meta.url), html, 'utf8');
}
