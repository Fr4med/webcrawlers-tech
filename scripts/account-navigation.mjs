const labels = {
  en: ['Sign in', 'Create account'], he: ['כניסה', 'יצירת חשבון'],
  de: ['Anmelden', 'Konto erstellen'], fr: ['Connexion', 'Créer un compte'],
  pl: ['Zaloguj', 'Utwórz konto'], sv: ['Logga in', 'Skapa konto'],
};

export function withAccountNavigation(html) {
  if (html.includes('class="account-signin"')) return html;
  const language = html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'en';
  const [signin,signup] = labels[language] || labels.en;
  const english = language === 'en' ? '' : ' title="Account pages are in English"';
  let next = html.replace(/(<nav id="navigation"[^>]*>)([\s\S]*?)(<\/nav>)/, (_,open,body,close) =>
    open + body.replace(/(<a href="(?:\/start|#audit)") class="button small"/, '$1') +
    `<a href="/signup" class="button small"${english}>${signup}</a>` + close +
    `<a href="/signin" class="account-signin"${english}>${signin}</a>`);
  return next;
}
