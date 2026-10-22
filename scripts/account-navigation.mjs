const labels = {
  en: ['Sign in', 'Create account'], he: ['כניסה', 'יצירת חשבון'],
  de: ['Anmelden', 'Konto erstellen'], fr: ['Connexion', 'Créer un compte'],
  pl: ['Zaloguj', 'Utwórz konto'], sv: ['Logga in', 'Skapa konto'],
};

export function withAccountNavigation(html) {
  html = html.replace(/href="\/(signin|signup)"/g, 'href="https://app.webcrawlers.tech/$1"');
  if (html.includes('class="account-signin"')) return html;
  const language = html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'en';
  const [signin,signup] = labels[language] || labels.en;
  const english = language === 'en' ? '' : ' title="Account pages are in English"';
  let next = html.replace(/(<nav id="navigation"[^>]*>)([\s\S]*?)(<\/nav>)/, (_,open,body,close) =>
    open + body.replace(/(<a href="(?:\/start|#audit)") class="button small"/, '$1') +
    `<a href="https://app.webcrawlers.tech/signup" class="button small"${english}>${signup}</a>` + close +
    `<a href="https://app.webcrawlers.tech/signin" class="account-signin"${english}>${signin}</a>`);
  return next;
}
