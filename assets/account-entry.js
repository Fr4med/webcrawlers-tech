(() => {
  'use strict';
  const route = document.currentScript?.dataset.accountEntry;
  if (route !== 'signin' && route !== 'signup') return;

  // The destination is fixed. Never forward a return URL, token, email or fragment.
  const target = new URL(`/${route}`, 'https://app.webcrawlers.tech');
  const workspaces = new URLSearchParams(window.location.search).getAll('workspace');
  if (workspaces.length === 1 && /^wc-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(workspaces[0])) {
    target.searchParams.set('workspace', workspaces[0]);
  }
  const fallback = document.getElementById('account-continue');
  if (fallback) fallback.href = target.href;
  try {
    window.location.replace(target.href);
  } catch {
    // The visible Continue link remains usable if automatic navigation is blocked.
  }
})();
