import {writeFileSync} from 'node:fs';
import {withAccountNavigation} from './scripts/account-navigation.mjs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homepageAlternates, languageSelector, siteRoot} from './scripts/review-metadata.mjs';

const copy = {
  "de": {
    "title": "WebCrawlers | Website-Checks und vereinbarte Verbesserungen",
    "description": "Ein betreutes Pilotprojekt für kleine Websites: bis zu 30 Seiten prüfen, Änderungen vereinbaren und Ergebnisse vor und nach der Umsetzung ansehen.",
    "navHow": "So funktioniert es",
    "navPricing": "Preise",
    "navFaq": "FAQ",
    "navContact": "Pilotprojekt besprechen",
    "eyebrow": "Betreutes Pilotprojekt für kleine Unternehmen",
    "headline": "Helfen Sie Kunden, Ihr Unternehmen zu finden.",
    "emphasis": "Wählen Sie sinnvolle Verbesserungen.",
    "intro": "Wir prüfen, ob Ihre Website auffindbar ist und ob Angebot und Kontakt klar sind. Adam erklärt die Ergebnisse und setzt nur vereinbarte Änderungen um.",
    "scopeTitle": "Was das Pilotprojekt umfasst",
    "scope": [
      "Eine aktive Website, eine Sprache und bis zu 30 vereinbarte Seiten",
      "Technische Prüfung und ein Bericht mit Prioritäten",
      "Bis zu drei vereinbarte technische Korrekturen und eine klarere Formulierung auf einer bestehenden Seite",
      "Die Nachkontrolle erfolgt 30 Tage nach der vereinbarten Veröffentlichung."
    ],
    "pricingTitle": "Zwei getrennte Positionen im Angebot",
    "pricing": "Die einmalige Einrichtung mit Adam und die Umsetzung werden getrennt angeboten. Wir nennen den Preis, nachdem wir die Website und den Umfang geprüft haben. Es gibt kein Abo oder kostenloses 30-Tage-Testangebot.",
    "limit": "Wir garantieren keine Rankings, Erwähnungen durch KI, Besucherzahlen oder Verkäufe. Änderungen werden nicht automatisch veröffentlicht.",
    "contactTitle": "Erzählen Sie uns von Ihrem Unternehmen",
    "contact": "Senden Sie die Website-Adresse, falls vorhanden, und Ihr wichtigstes Anliegen. Adam antwortet innerhalb von zwei Geschäftstagen. Der Zeitplan für die Arbeit wird separat im Angebot vereinbart.",
    "name": "Name oder Firma *",
    "email": "E-Mail *",
    "note": "Website und Ihr Anliegen",
    "send": "Pilotprojekt besprechen",
    "sending": "Wird gesendet…",
    "sent": "Vielen Dank. Wir antworten per E-Mail.",
    "error": "Senden fehlgeschlagen. Schreiben Sie bitte an hello@webcrawlers.tech.",
    "invalid": "Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse ein.",
    "prefer": "Lieber per E-Mail?",
    "context": "Noch keine Website, oder verwaltet sie jemand anderes? Erzählen Sie uns, was Ihr Unternehmen braucht.",
    "art": "<figure class=\"locale-art generated-art\" data-generated-scene=\"audit\"><img src=\"/assets/generated/2026-10-08/audit.webp\" srcset=\"/assets/generated/2026-10-08/audit-640.webp 640w, /assets/generated/2026-10-08/audit.webp 1280w\" sizes=\"(max-width: 620px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 64px), (max-width: 1304px) calc((100vw - 128px) / 2), 588px\" alt=\"\" width=\"1280\" height=\"720\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"><figcaption class=\"locale-art-caption\">Illustration</figcaption></figure>"
  },
  "fr": {
    "title": "WebCrawlers | Contrôle du site et corrections convenues",
    "description": "Un projet pilote accompagné pour les petits sites : examiner jusqu’à 30 pages, convenir des corrections et vérifier le résultat.",
    "navHow": "Fonctionnement",
    "navPricing": "Tarifs",
    "navFaq": "FAQ",
    "navContact": "Discuter du pilote",
    "eyebrow": "Projet pilote accompagné pour petites entreprises",
    "headline": "Aidez les clients à trouver votre entreprise.",
    "emphasis": "Choisissez les améliorations utiles.",
    "intro": "Nous vérifions si votre site est facile à trouver et si votre offre et vos coordonnées sont claires. Adam explique les résultats et applique seulement les changements convenus.",
    "scopeTitle": "Ce que comprend le pilote",
    "scope": [
      "Un site en ligne, une langue et jusqu’à 30 pages convenues",
      "Un contrôle technique et un rapport classé par priorité",
      "Jusqu’à trois corrections techniques convenues et une amélioration de clarté sur une page existante",
      "Le suivi a lieu 30 jours après la publication convenue."
    ],
    "pricingTitle": "Deux postes distincts dans le devis",
    "pricing": "La mise en place avec Adam et le travail de correction sont chiffrés séparément après examen du site. Ce pilote n’est ni un abonnement ni un essai gratuit de 30 jours.",
    "limit": "Nous ne garantissons ni classement, ni mention par une IA, ni trafic, ni ventes. Aucun changement n’est publié automatiquement.",
    "contactTitle": "Parlez-nous de votre entreprise",
    "contact": "Envoyez l’adresse du site, si vous en avez un, et votre principal objectif. Adam répond sous deux jours ouvrés. Le calendrier de réalisation est convenu séparément dans le devis.",
    "name": "Nom ou entreprise *",
    "email": "E-mail *",
    "note": "Votre site et votre demande",
    "send": "Discuter du pilote",
    "sending": "Envoi…",
    "sent": "Merci. Nous vous répondrons par e-mail.",
    "error": "Envoi impossible. Écrivez à hello@webcrawlers.tech.",
    "invalid": "Indiquez votre nom et une adresse e-mail valide.",
    "prefer": "Vous préférez un e-mail ?",
    "context": "Vous n’avez pas encore de site, ou quelqu’un d’autre le gère ? Dites-nous ce dont votre entreprise a besoin.",
    "art": "<figure class=\"locale-art generated-art\" data-generated-scene=\"audit\"><img src=\"/assets/generated/2026-10-08/audit.webp\" srcset=\"/assets/generated/2026-10-08/audit-640.webp 640w, /assets/generated/2026-10-08/audit.webp 1280w\" sizes=\"(max-width: 620px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 64px), (max-width: 1304px) calc((100vw - 128px) / 2), 588px\" alt=\"\" width=\"1280\" height=\"720\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"><figcaption class=\"locale-art-caption\">Illustration</figcaption></figure>"
  },
  "pl": {
    "title": "WebCrawlers | Sprawdzenie witryny i uzgodnione poprawki",
    "description": "Pilotaż dla małych witryn: analiza do 30 stron, uzgodnione poprawki i sprawdzenie efektu.",
    "navHow": "Jak to działa",
    "navPricing": "Ceny",
    "navFaq": "FAQ",
    "navContact": "Porozmawiajmy o pilotażu",
    "eyebrow": "Pilotaż prowadzony przez założyciela",
    "headline": "Pomóż klientom znaleźć Twoją firmę.",
    "emphasis": "Wybierz potrzebne zmiany.",
    "intro": "Sprawdzamy, czy łatwo znaleźć witrynę oraz czy oferta i dane kontaktowe są jasne. Adam wyjaśnia wyniki i wdraża tylko uzgodnione zmiany.",
    "scopeTitle": "Zakres pilotażu",
    "scope": [
      "Jedna działająca witryna, jeden język i do 30 uzgodnionych stron",
      "Kontrola techniczna i raport z priorytetami",
      "Do trzech uzgodnionych poprawek technicznych i jedna poprawa jasności istniejącej strony",
      "Kontrola następuje 30 dni po uzgodnionej publikacji."
    ],
    "pricingTitle": "Dwie osobne pozycje w wycenie",
    "pricing": "Jednorazowe przygotowanie z Adamem i prace naprawcze wyceniamy osobno po obejrzeniu witryny. Pilotaż nie jest abonamentem ani 30-dniowym darmowym okresem próbnym.",
    "limit": "Nie gwarantujemy pozycji w wynikach, wzmianek w AI, ruchu ani sprzedaży. Zmiany nie są publikowane automatycznie.",
    "contactTitle": "Opowiedz nam o swojej firmie",
    "contact": "Wyślij adres witryny, jeśli ją masz, oraz główny problem. Adam odpowiada w ciągu dwóch dni roboczych. Termin realizacji jest uzgadniany osobno w wycenie.",
    "name": "Imię lub firma *",
    "email": "E-mail *",
    "note": "Witryna i Twój cel",
    "send": "Porozmawiajmy o pilotażu",
    "sending": "Wysyłanie…",
    "sent": "Dziękujemy. Odpowiemy e-mailem.",
    "error": "Nie udało się wysłać. Napisz na hello@webcrawlers.tech.",
    "invalid": "Podaj imię i poprawny adres e-mail.",
    "prefer": "Wolisz e-mail?",
    "context": "Nie masz jeszcze witryny lub zarządza nią ktoś inny? Opowiedz, czego potrzebuje Twoja firma.",
    "art": "<figure class=\"locale-art generated-art\" data-generated-scene=\"audit\"><img src=\"/assets/generated/2026-10-08/audit.webp\" srcset=\"/assets/generated/2026-10-08/audit-640.webp 640w, /assets/generated/2026-10-08/audit.webp 1280w\" sizes=\"(max-width: 620px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 64px), (max-width: 1304px) calc((100vw - 128px) / 2), 588px\" alt=\"\" width=\"1280\" height=\"720\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"><figcaption class=\"locale-art-caption\">Ilustracja</figcaption></figure>"
  },
  "sv": {
    "title": "WebCrawlers | Webbplatskontroller och överenskomna åtgärder",
    "description": "Ett personligt pilotprojekt för små webbplatser: granska upp till 30 sidor, kom överens om ändringar och kontrollera resultatet.",
    "navHow": "Så fungerar det",
    "navPricing": "Pris",
    "navFaq": "FAQ",
    "navContact": "Prata om ett pilotprojekt",
    "eyebrow": "Personligt pilotprojekt för små företag",
    "headline": "Hjälp kunderna att hitta ditt företag.",
    "emphasis": "Välj vad som behöver förbättras.",
    "intro": "Vi kontrollerar om webbplatsen går att hitta och om erbjudandet och kontaktuppgifterna är tydliga. Adam förklarar resultaten och genomför bara överenskomna ändringar.",
    "scopeTitle": "Det här ingår",
    "scope": [
      "En aktiv webbplats, ett språk och upp till 30 överenskomna sidor",
      "Teknisk granskning och en prioriterad rapport",
      "Upp till tre överenskomna tekniska åtgärder och en tydligare text på en befintlig sida",
      "Uppföljningen sker 30 dagar efter den överenskomna publiceringen."
    ],
    "pricingTitle": "Två separata delar i offerten",
    "pricing": "Engångsstarten med Adam och arbetet med åtgärder prissätts var för sig efter att vi granskat webbplatsen. Piloten är ingen prenumeration eller gratis 30-dagarsperiod.",
    "limit": "Vi garanterar inte placeringar, omnämnanden av AI, trafik eller försäljning. Inga ändringar publiceras automatiskt.",
    "contactTitle": "Berätta om ditt företag",
    "contact": "Skicka webbadressen om du har en webbplats och ditt viktigaste mål. Adam svarar inom två arbetsdagar. Tidsplanen för arbetet avtalas separat i offerten.",
    "name": "Namn eller företag *",
    "email": "E-post *",
    "note": "Webbplats och önskemål",
    "send": "Prata om ett pilotprojekt",
    "sending": "Skickar…",
    "sent": "Tack. Vi svarar via e-post.",
    "error": "Det gick inte att skicka. Skriv till hello@webcrawlers.tech.",
    "invalid": "Ange namn och en giltig e-postadress.",
    "prefer": "Föredrar du e-post?",
    "context": "Har du ingen webbplats ännu, eller sköter någon annan den? Berätta vad ditt företag behöver.",
    "art": "<figure class=\"locale-art generated-art\" data-generated-scene=\"audit\"><img src=\"/assets/generated/2026-10-08/audit.webp\" srcset=\"/assets/generated/2026-10-08/audit-640.webp 640w, /assets/generated/2026-10-08/audit.webp 1280w\" sizes=\"(max-width: 620px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 64px), (max-width: 1304px) calc((100vw - 128px) / 2), 588px\" alt=\"\" width=\"1280\" height=\"720\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"><figcaption class=\"locale-art-caption\">Illustration</figcaption></figure>"
  },
  "he": {
    "title": "WebCrawlers | בדיקות אתר ותיקונים מוסכמים",
    "description": "פיילוט מלווה לעסקים קטנים: בדיקה של עד 30 עמודים, תיקונים מוסכמים ובדיקת התוצאה באתר הפעיל.",
    "navHow": "איך זה עובד",
    "navPricing": "תמחור",
    "navFaq": "שאלות נפוצות",
    "navContact": "לדבר על הפיילוט",
    "eyebrow": "פיילוט בליווי אישי לעסקים קטנים",
    "headline": "לעזור ללקוחות למצוא את העסק שלכם.",
    "emphasis": "ולבחור מה לשפר באתר.",
    "intro": "אנחנו בודקים אם קל למצוא את האתר ואם ברור מה אתם מציעים ואיך ליצור קשר. אדם מסביר את הממצאים ומבצע רק שינויים שסוכמו.",
    "scopeTitle": "מה כולל הפיילוט",
    "scope": [
      "אתר פעיל אחד, שפה אחת ועד 30 עמודים מוסכמים",
      "בדיקה טכנית ודוח עם סדר עדיפויות",
      "עד שלושה תיקונים טכניים מוסכמים ושיפור בהירות בעמוד קיים אחד",
      "בדיקת המעקב מתבצעת 30 יום לאחר הפרסום שסוכם."
    ],
    "pricingTitle": "שני סעיפים נפרדים בהצעת המחיר",
    "pricing": "ההקמה החד-פעמית עם אדם ועבודת התיקון מתומחרות בנפרד לאחר בדיקת האתר. הפיילוט אינו מנוי ואינו ניסיון חינם ל-30 יום.",
    "limit": "אין הבטחה לדירוגים, לאזכורים בכלי AI, לתנועה או למכירות. שינויים אינם מתפרסמים אוטומטית.",
    "contactTitle": "ספרו לנו על העסק שלכם",
    "contact": "שלחו את כתובת האתר אם יש לכם אתר, ואת הנושא החשוב לכם. אדם משיב בתוך שני ימי עסקים. לוח הזמנים לביצוע העבודה מסוכם בנפרד בהצעת המחיר.",
    "name": "שם או חברה *",
    "email": "דוא״ל *",
    "note": "כתובת האתר ומה תרצו לשפר",
    "send": "לדבר על הפיילוט",
    "sending": "שולחים…",
    "sent": "תודה. נחזור אליכם בדוא״ל.",
    "error": "השליחה נכשלה. כתבו ל-hello@webcrawlers.tech.",
    "invalid": "נא להזין שם וכתובת דוא״ל תקינה.",
    "prefer": "מעדיפים דוא״ל?",
    "context": "אין לכם עדיין אתר, או שמישהו אחר מנהל אותו? ספרו לנו מה העסק שלכם צריך.",
    "art": "<figure class=\"locale-art generated-art\" data-generated-scene=\"audit\"><img src=\"/assets/generated/2026-10-08/audit.webp\" srcset=\"/assets/generated/2026-10-08/audit-640.webp 640w, /assets/generated/2026-10-08/audit.webp 1280w\" sizes=\"(max-width: 620px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 64px), (max-width: 1304px) calc((100vw - 128px) / 2), 588px\" alt=\"\" width=\"1280\" height=\"720\" loading=\"eager\" fetchpriority=\"high\" decoding=\"async\"><figcaption class=\"locale-art-caption\">איור</figcaption></figure>"
  }
};
const formCopy = {
  "de": {
    "consent": "WebCrawlers darf mich zu dieser Anfrage kontaktieren und meine Angaben wie im Datenschutzhinweis beschrieben verarbeiten.",
    "privacy": "Datenschutz auf Englisch",
    "service": "Leistungsumfang auf Englisch",
    "reference": "Ihre Referenz",
    "received": "Ihre Anfrage wurde angenommen. Bitte bewahren Sie die Referenz auf. Adam antwortet innerhalb von zwei Geschäftstagen. Der Zeitplan für die Arbeit wird separat im Angebot vereinbart.",
    "retry": "Der Eingang konnte nicht bestätigt werden. Ihre Angaben bleiben erhalten. Versuchen Sie es mit derselben Referenz erneut oder schreiben Sie an hello@webcrawlers.tech."
  },
  "fr": {
    "consent": "J’accepte que WebCrawlers me contacte au sujet de cette demande et traite mes informations selon la politique de confidentialité.",
    "privacy": "Confidentialité en anglais",
    "service": "Conditions du service en anglais",
    "reference": "Votre référence",
    "received": "Votre demande a été acceptée. Conservez cette référence. Adam répond sous deux jours ouvrés. Le calendrier de réalisation est convenu séparément dans le devis.",
    "retry": "La réception n’a pas pu être confirmée. Vos informations sont conservées ici. Réessayez avec la même référence ou écrivez à hello@webcrawlers.tech."
  },
  "pl": {
    "consent": "Zgadzam się na kontakt WebCrawlers w sprawie tego zapytania i przetwarzanie podanych informacji zgodnie z polityką prywatności.",
    "privacy": "Prywatność po angielsku",
    "service": "Zakres usługi po angielsku",
    "reference": "Numer zapytania",
    "received": "Zapytanie zostało przyjęte. Zachowaj jego numer. Adam odpowiada w ciągu dwóch dni roboczych. Termin realizacji jest uzgadniany osobno w wycenie.",
    "retry": "Nie udało się potwierdzić przyjęcia. Dane pozostają w formularzu. Spróbuj ponownie z tym samym numerem lub napisz na hello@webcrawlers.tech."
  },
  "sv": {
    "consent": "Jag godkänner att WebCrawlers kontaktar mig om denna förfrågan och behandlar mina uppgifter enligt integritetspolicyn.",
    "privacy": "Integritet på engelska",
    "service": "Tjänstens omfattning på engelska",
    "reference": "Din referens",
    "received": "Din förfrågan har tagits emot. Spara referensen. Adam svarar inom två arbetsdagar. Tidsplanen för arbetet avtalas separat i offerten.",
    "retry": "Mottagandet kunde inte bekräftas. Dina uppgifter finns kvar. Försök igen med samma referens eller skriv till hello@webcrawlers.tech."
  },
  "he": {
    "consent": "אני מסכים ש-WebCrawlers ייצרו איתי קשר לגבי הפנייה ויעבדו את הפרטים שמסרתי בהתאם למדיניות הפרטיות.",
    "privacy": "מדיניות פרטיות באנגלית",
    "service": "פרטי השירות באנגלית",
    "reference": "מספר הפנייה",
    "received": "הפנייה התקבלה. שמרו את מספר הפנייה. אדם משיב בתוך שני ימי עסקים. לוח הזמנים לביצוע העבודה מסוכם בנפרד בהצעת המחיר.",
    "retry": "לא ניתן לאשר שהפנייה התקבלה. הפרטים נשמרו בטופס. נסו שוב עם אותו מספר פנייה או כתבו ל-hello@webcrawlers.tech."
  }
};
const extra = {
  "de": {
    "language": "Sprache",
    "english": "auf Englisch",
    "skip": "Zum Inhalt springen",
    "menu": "Menü",
    "audit": "Website-Check",
    "about": "Über Adam",
    "quotes": "Umfang & Angebot",
    "privacy": "Datenschutz",
    "service": "Leistungsumfang",
    "accessibility": "Barrierefreiheit",
    "cookies": "Cookie-Einstellungen",
    "short": "Kurze Anfrage",
    "detail": "Ausführliches Formular auf Englisch",
    "explain": "Nutzen Sie diese kurze Anfrage in Ihrer Sprache oder das ausführliche Formular auf Englisch. Beide Wege führen zu Adam. Geben Sie an, ob Sie eine Website haben und wer sie verwaltet.",
    "offer": "Website-Checks und vereinbarte Verbesserungen",
    "scope": "Möglicher Ausgangsumfang",
    "pricing": "Die erste Anfrage und die Besprechung des Umfangs kosten nichts. Ein ausführlicher Check und Änderungen beginnen erst nach Ihrer Zustimmung zu einem schriftlichen Angebot. Der Preis hängt von Seiten, Plattform, Zugang und Aufwand ab.",
    "send": "Anfrage senden",
    "copy": "Referenz kopieren",
    "copySuccess": "Referenz kopiert",
    "copyFallback": "Bitte kopieren Sie die sichtbare Referenz.",
    "nocharge": "Ihre Anfrage erteilt keinen Auftrag und löst keine Zahlung aus.",
    "follow": "Die Nachkontrolle erfolgt 30 Tage nach der vereinbarten Veröffentlichung."
  },
  "fr": {
    "language": "Langue",
    "english": "en anglais",
    "skip": "Aller au contenu",
    "menu": "Menu",
    "audit": "Contrôle du site",
    "about": "À propos d’Adam",
    "quotes": "Périmètre et devis",
    "privacy": "Confidentialité",
    "service": "Détails du service",
    "accessibility": "Accessibilité",
    "cookies": "Préférences de cookies",
    "short": "Demande courte",
    "detail": "Formulaire détaillé en anglais",
    "explain": "Utilisez cette demande courte dans votre langue ou le formulaire détaillé en anglais. Les deux sont transmis à Adam. Précisez si vous avez un site et qui le gère.",
    "offer": "Contrôle du site et corrections convenues",
    "scope": "Périmètre de départ possible",
    "pricing": "La première demande et la discussion du périmètre sont gratuites. Un contrôle détaillé et les corrections commencent uniquement après votre accord sur un devis écrit. Le prix dépend des pages, de la plateforme, des accès et du travail nécessaire.",
    "send": "Envoyer la demande",
    "copy": "Copier la référence",
    "copySuccess": "Référence copiée",
    "copyFallback": "Copiez la référence affichée.",
    "nocharge": "Votre demande ne commande aucun travail et ne déclenche aucun paiement.",
    "follow": "Le suivi a lieu 30 jours après la publication convenue."
  },
  "pl": {
    "language": "Język",
    "english": "po angielsku",
    "skip": "Przejdź do treści",
    "menu": "Menu",
    "audit": "Sprawdzenie witryny",
    "about": "O Adamie",
    "quotes": "Zakres i wycena",
    "privacy": "Prywatność",
    "service": "Szczegóły usługi",
    "accessibility": "Dostępność",
    "cookies": "Ustawienia plików cookie",
    "short": "Krótkie zapytanie",
    "detail": "Szczegółowy formularz po angielsku",
    "explain": "Skorzystaj z krótkiego zapytania w swoim języku lub ze szczegółowego formularza po angielsku. Oba trafiają do Adama. Napisz, czy masz witrynę i kto nią zarządza.",
    "offer": "Sprawdzenie witryny i uzgodnione poprawki",
    "scope": "Możliwy zakres początkowy",
    "pricing": "Pierwsze zapytanie i rozmowa o zakresie są bezpłatne. Szczegółowa analiza i poprawki rozpoczynają się po zaakceptowaniu pisemnej wyceny. Cena zależy od stron, platformy, dostępu i potrzebnych prac.",
    "send": "Wyślij zapytanie",
    "copy": "Kopiuj numer",
    "copySuccess": "Numer skopiowany",
    "copyFallback": "Skopiuj widoczny numer.",
    "nocharge": "Zapytanie nie zleca prac ani nie powoduje płatności.",
    "follow": "Kontrola następuje 30 dni po uzgodnionej publikacji."
  },
  "sv": {
    "language": "Språk",
    "english": "på engelska",
    "skip": "Hoppa till innehåll",
    "menu": "Meny",
    "audit": "Webbplatskontroll",
    "about": "Om Adam",
    "quotes": "Omfattning och offert",
    "privacy": "Integritet",
    "service": "Tjänstens omfattning",
    "accessibility": "Tillgänglighet",
    "cookies": "Cookieinställningar",
    "short": "Kort förfrågan",
    "detail": "Utförligt formulär på engelska",
    "explain": "Använd den korta förfrågan på ditt språk eller det utförliga formuläret på engelska. Båda går till Adam. Berätta om du har en webbplats och vem som sköter den.",
    "offer": "Webbplatskontroller och överenskomna åtgärder",
    "scope": "Möjlig första omfattning",
    "pricing": "Den första förfrågan och samtalet om omfattning kostar inget. En utförlig kontroll och åtgärder börjar först när du godkänt en skriftlig offert. Priset beror på sidor, plattform, åtkomst och arbetsbehov.",
    "send": "Skicka förfrågan",
    "copy": "Kopiera referens",
    "copySuccess": "Referensen kopierad",
    "copyFallback": "Kopiera den synliga referensen.",
    "nocharge": "Din förfrågan beställer inget arbete och utlöser ingen betalning.",
    "follow": "Uppföljningen sker 30 dagar efter den överenskomna publiceringen."
  },
  "he": {
    "language": "שפה",
    "english": "באנגלית",
    "skip": "דילוג לתוכן",
    "menu": "תפריט",
    "audit": "בדיקת האתר",
    "about": "על אדם",
    "quotes": "היקף והצעת מחיר",
    "privacy": "פרטיות",
    "service": "פרטי השירות",
    "accessibility": "נגישות",
    "cookies": "הגדרות עוגיות",
    "short": "פנייה קצרה",
    "detail": "טופס מפורט באנגלית",
    "explain": "אפשר להשתמש בפנייה הקצרה בשפה שלכם או בטופס המפורט באנגלית. שני המסלולים מגיעים לאדם. ציינו אם יש לכם אתר ומי מנהל אותו.",
    "offer": "בדיקות אתר ותיקונים מוסכמים",
    "scope": "היקף התחלתי אפשרי",
    "pricing": "הפנייה הראשונה והשיחה על היקף העבודה הן ללא תשלום. בדיקה מפורטת ותיקונים מתחילים רק לאחר אישור הצעת מחיר בכתב. המחיר תלוי בעמודים, בפלטפורמה, בהרשאות הגישה ובהיקף העבודה.",
    "send": "שליחת פנייה",
    "copy": "העתקת מספר הפנייה",
    "copySuccess": "מספר הפנייה הועתק",
    "copyFallback": "העתיקו את מספר הפנייה המוצג.",
    "nocharge": "הפנייה אינה מזמינה עבודה ואינה מחייבת בתשלום.",
    "follow": "בדיקת המעקב מתבצעת 30 יום לאחר הפרסום שסוכם."
  }
};

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const brand = `<a href="/" class="brand" lang="en"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" aria-hidden="true"><path d="M5 10 16 4l11 6v12l-11 6-11-6V10Z" stroke="currentColor" stroke-width="1.5"/><path d="m5 10 11 6 11-6M16 16v12M10 7v12l11 6" stroke="currentColor" stroke-width="1.5"/></svg><span>webcrawlers<span class="brand-dot">.</span></span></a>`;
const menuIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
function englishLink(path,label,e) { return `<a href="${path}">${label} <span class="wc-destination-language">${e.english}</span></a>`; }

export function renderLocale(lang) {
  const t=copy[lang], f=formCopy[lang], e=extra[lang];
  if(!t)throw new Error('Unknown locale');
  t.description=t.intro;
  return `<!doctype html>
<html lang="${lang}"${lang==='he'?' dir="rtl"':''}>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(t.title)}</title><meta name="description" content="${escape(t.description)}">
<link rel="canonical" href="https://webcrawlers.tech/${lang}/">
${homepageAlternates()}
<link rel="icon" type="image/svg+xml" href="/assets/brand/mark.svg"><meta name="theme-color" content="#f5f3ed">
<link rel="stylesheet" href="/assets/launch.css"><link rel="stylesheet" href="/assets/refined.css"><link rel="stylesheet" href="/assets/cookie-preferences.css"><link rel="stylesheet" href="/assets/accessibility.css"><link rel="stylesheet" href="/assets/review-locales.css">
<script src="/assets/cookie-preferences.js" defer></script><script src="/assets/analytics-config.js" defer></script><script src="/assets/analytics.js" defer></script><script src="/assets/launch.js" defer></script><script src="/assets/inquiry.js" defer></script><script src="/assets/accessibility.js" defer></script>
<meta property="og:type" content="website"><meta property="og:url" content="https://webcrawlers.tech/${lang}/"><meta property="og:title" content="${escape(t.title)}"><meta property="og:description" content="${escape(t.description)}"><meta property="og:image" content="https://webcrawlers.tech/assets/brand/social-preview.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="WebCrawlers"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://webcrawlers.tech/assets/brand/social-preview.png">
</head><body class="brand-locale wc-shared-locale"><a class="skip" href="#main">${e.skip}</a>
<header class="site-header"><div class="container nav">${brand}<button class="menu-button" aria-expanded="false" aria-controls="navigation" type="button">${e.menu} ${menuIcon}</button><nav id="navigation" aria-label="${e.menu}">${englishLink('/ai-visibility-audit',e.audit,e)}${englishLink('/how-it-works',t.navHow,e)}${englishLink('/ai-visibility-audit-pricing',e.quotes,e)}${englishLink('/about',e.about,e)}<a href="#audit" class="button small">${e.short}</a></nav></div></header>
${languageSelector(lang,e.language)}
<noscript><style>.menu-button{display:none!important}#navigation{display:flex!important;position:static!important;flex-wrap:wrap}.nav{flex-wrap:wrap;height:auto}#lead-form{display:none}</style></noscript>
<main id="main" tabindex="-1"><section class="hero container wc-locale-hero"><div class="locale-copy"><p class="eyebrow">${e.offer}</p><h1>${t.headline}<br><span>${t.emphasis}</span></h1><p class="intro">${t.intro}</p><p class="locale-context">${t.context}</p><div class="actions"><a class="button" href="#audit">${e.short}</a><a class="button secondary" href="/start">${e.detail}</a></div><p class="micro">${t.limit}</p></div>${t.art}</section>
<section class="container section wc-locale-scope"><p class="eyebrow">${e.scope}</p><h2>${e.offer}</h2><ul class="scope-list">${t.scope.map(item=>`<li>${item}</li>`).join('')}</ul><a class="text-link" href="/service">${e.service} · ${e.english} <span aria-hidden="true">→</span></a></section>
<section class="surface" id="pricing"><div class="container section wc-locale-quote"><h2>${e.quotes}</h2><p class="intro">${e.pricing}</p><a class="button secondary" href="/ai-visibility-audit-pricing">${e.quotes} · ${e.english}</a></div></section>
<section class="container section wc-locale-contact" id="audit"><div><p class="eyebrow">${e.short}</p><h2>${t.contactTitle}</h2><p class="intro">${t.contact}</p><p>${e.explain}</p><a class="text-link" href="/start">${e.detail} <span aria-hidden="true">→</span></a><noscript><p>${t.prefer} <a href="mailto:hello@webcrawlers.tech">hello@webcrawlers.tech</a></p></noscript></div>
<form class="contact-panel" id="lead-form" data-invalid="${escape(t.invalid)}" data-sending="${escape(t.sending)}" data-received="${escape(f.received)}" data-retry="${escape(f.retry)}" data-reference="${escape(f.reference)}"><label for="lead-name">${t.name}</label><input id="lead-name" name="name" autocomplete="name" required maxlength="120"><label for="lead-email">${t.email}</label><input id="lead-email" name="email" type="email" autocomplete="email" required maxlength="200" spellcheck="false" autocapitalize="none" dir="ltr"><label for="lead-note">${t.note}</label><textarea id="lead-note" name="note" maxlength="1000" rows="5"></textarea><div class="honeypot" aria-hidden="true"><label>Leave this blank<input name="_hp" tabindex="-1" autocomplete="off"></label></div><label class="inquiry-consent" for="lead-consent"><input id="lead-consent" type="checkbox" name="consent" required><span>${f.consent} <a href="/privacy">${f.privacy}</a> · <a href="/service">${f.service}</a></span></label><p class="micro">${e.nocharge}</p><button class="button" type="submit">${e.send}</button><p id="lead-msg" role="status" aria-live="polite"></p><p id="lead-reference" class="inquiry-reference" dir="ltr"></p><button class="button secondary" type="button" data-copy-target="lead-reference" data-copy-success="${e.copySuccess}" data-copy-fallback="${e.copyFallback}" hidden>${e.copy}</button><p id="reference-action-status" role="status" class="inquiry-reference"></p><p class="micro">${t.prefer} <a href="mailto:hello@webcrawlers.tech">hello@webcrawlers.tech</a></p></form></section></main>
<footer class="footer container"><div>${brand}<p>${e.offer}</p><small>© 2026 WebCrawlers · Adam</small></div><nav aria-label="${e.menu}">${englishLink('/accessibility',e.accessibility,e)}${englishLink('/how-it-works',t.navHow,e)}${englishLink('/faq',t.navFaq,e)}${englishLink('/about',e.about,e)}${englishLink('/service',e.service,e)}${englishLink('/privacy',e.privacy,e)}<a href="/cookies" data-cookie-settings>${e.cookies}</a><a href="mailto:hello@webcrawlers.tech">hello@webcrawlers.tech</a></nav></footer>
</body></html>
`;
}
export function writeLocaleSources() {
  for(const lang of Object.keys(copy)) writeFileSync(resolve(siteRoot,`src/pages/${lang}/index.html`),withAccountNavigation(renderLocale(lang)));
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  writeLocaleSources();
  console.log('Generated five translated source pages with the shared shell and enquiry component.');
  if(!process.argv.includes('--sources-only')) await import('./build-refined.mjs');
}
