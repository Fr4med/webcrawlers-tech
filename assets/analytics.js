// Minimal PostHog Capture API integration. No remote SDK, autocapture or replay.
(() => {
  'use strict';
  if (window.WebCrawlersAnalytics) return;
  const config = window.WebCrawlersAnalyticsConfig;
  const storageKey = 'webcrawlers-analytics-session-v1';
  const lifetime = 30 * 60 * 1000;
  const paths = new Set(['/', '/start', '/about', '/ai-visibility-audit', '/ai-visibility-audit-pricing', '/example', '/privacy', '/cookies', '/service', '/how-it-works', '/faq', '/what-is-geo', '/he/', '/de/', '/fr/', '/pl/', '/sv/']);
  const events = new Set(['$pageview', 'assessment_cta_clicked', 'enquiry_started', 'enquiry_step_viewed', 'enquiry_validation_failed', 'enquiry_submit_attempted', 'enquiry_receipt_confirmed', 'enquiry_receipt_unconfirmed']);
  const sources = new Set(['google', 'bing', 'chatgpt', 'perplexity', 'claude', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'x', 'reddit', 'whatsapp', 'email']);
  const mediums = new Set(['organic', 'social', 'referral', 'email', 'paid', 'cpc']);
  const campaigns = new Set(['launch', 'visibility-audit', 'webcrawlers']);
  const referrers = {'google.com':'google','www.google.com':'google','bing.com':'bing','www.bing.com':'bing','chatgpt.com':'chatgpt','perplexity.ai':'perplexity','www.perplexity.ai':'perplexity','claude.ai':'claude','linkedin.com':'linkedin','www.linkedin.com':'linkedin','lnkd.in':'linkedin','facebook.com':'facebook','www.facebook.com':'facebook','m.facebook.com':'facebook','l.facebook.com':'facebook','instagram.com':'instagram','www.instagram.com':'instagram','l.instagram.com':'instagram','youtube.com':'youtube','www.youtube.com':'youtube','tiktok.com':'tiktok','www.tiktok.com':'tiktok','x.com':'x','t.co':'x','reddit.com':'reddit','www.reddit.com':'reddit','whatsapp.com':'whatsapp','web.whatsapp.com':'whatsapp'};
  const pending = new Set();
  const once = new Set();
  let pageViewed = false, session = null;
  function clear() {
    for (const controller of pending) controller.abort();
    pending.clear();
    session = null;
    pageViewed = false;
    once.clear();
    try { sessionStorage.removeItem(storageKey); } catch {}
  }
  function permitted() {
    const allowed = location.hostname === 'webcrawlers.tech' && location.protocol === 'https:'
      && config?.host === 'https://eu.i.posthog.com' && /^phc_[A-Za-z0-9]+$/.test(config?.token || '')
      && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1'
      && window.WebCrawlersPrivacy?.allows('analytics') === true;
    if (!allowed) clear();
    return allowed;
  }
  function route() {
    let path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (path === '/index') path = '/';
    if (path.length > 1 && path.endsWith('/') && !/^\/(he|de|fr|pl|sv)\/$/.test(path)) path = path.slice(0, -1);
    return paths.has(path) ? path : null;
  }
  function source() {
    const query = new URLSearchParams(location.search);
    const pick = (key, choices) => { const values = query.getAll(key); return values.length === 1 && choices.has(values[0]) ? values[0] : null; };
    let referringSource = 'direct-or-unknown';
    try { const url = new URL(document.referrer); if (url.protocol === 'https:' && !url.username && !url.password) referringSource = referrers[url.hostname] || 'direct-or-unknown'; } catch {}
    return {source: pick('utm_source', sources) || referringSource, medium: pick('utm_medium', mediums) || 'unspecified', campaign: pick('utm_campaign', campaigns) || 'unspecified'};
  }
  function valid(value) {
    return value && Object.keys(value).sort().join(',') === 'campaign,count,id,medium,source,startedAt'
      && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id)
      && Number.isFinite(value.startedAt) && value.startedAt <= Date.now() && Date.now() - value.startedAt < lifetime
      && Number.isInteger(value.count) && value.count >= 0 && value.count <= 100
      && (sources.has(value.source) || value.source === 'direct-or-unknown')
      && (mediums.has(value.medium) || value.medium === 'unspecified') && (campaigns.has(value.campaign) || value.campaign === 'unspecified');
  }
  function visit() {
    try {
      const saved = sessionStorage.getItem(storageKey);
      const record = saved && saved.length < 1024 ? JSON.parse(saved) : null;
      session = valid(record) ? record : valid(session) ? session : null;
    } catch { if (!valid(session)) session = null; }
    if (!session) session = {id: crypto.randomUUID(), startedAt: Date.now(), count: 0, ...source()};
    return session;
  }
  function capture(event, details = {}) {
    try {
      if (!permitted() || !events.has(event)) return false;
      const path = route();
      if (!path) return false;
      const current = visit();
      if (current.count >= 100) return false;
      // Request references are used for page-local deduplication only. They never leave the browser.
      const dedupe = event === '$pageview' || event === 'enquiry_started' ? event
        : event === 'enquiry_receipt_confirmed' && typeof details.reference === 'string' ? event + ':' + details.reference : null;
      if (dedupe && once.has(dedupe)) return false;
      if (dedupe) once.add(dedupe);
      const language = document.documentElement.lang?.split('-')[0];
      const properties = {
        $current_url: 'https://webcrawlers.tech' + path, $pathname: path, $host: 'webcrawlers.tech',
        $session_id: current.id, $process_person_profile: false, $geoip_disable: true, $ip: null,
        $lib: 'webcrawlers-capture', $lib_version: '1.0.0',
        source: current.source, medium: current.medium, campaign: current.campaign,
        language: ['en','he','de','fr','pl','sv'].includes(language) ? language : 'en',
        viewport_group: innerWidth < 768 ? 'mobile' : 'desktop',
        environment: location.search === '?wc_qa=posthog-install-20261020' ? 'qa' : 'production',
        schema_version: 1
      };
      if (Number.isInteger(details.step) && details.step >= 1 && details.step <= 3) properties.step = details.step;
      if (['timeout', 'unconfirmed', 'invalid'].includes(details.reason)) properties.reason = details.reason;
      current.count++;
      try { sessionStorage.setItem(storageKey, JSON.stringify(current)); } catch {}
      const controller = new AbortController();
      pending.add(controller);
      const timeout = setTimeout(() => controller.abort(), 5000);
      // No durable queue or retries. A small in-flight request may finish during navigation;
      // withdrawal on this page aborts it. Data already delivered cannot be recalled.
      fetch(config.host + '/i/v0/e/', {
        method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
        signal: controller.signal, body: JSON.stringify({api_key: config.token, event, distinct_id: current.id, properties, timestamp: new Date().toISOString()})
      }).catch(() => {}).finally(() => { clearTimeout(timeout); pending.delete(controller); });
      return true;
    } catch { return false; }
  }
  function pageview() { if (permitted() && !pageViewed) pageViewed = capture('$pageview'); }
  window.WebCrawlersAnalytics = Object.freeze({capture});
  document.addEventListener('webcrawlers:privacy-change', pageview);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pageview(); });
  window.addEventListener('pageshow', pageview);
  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    try { const url = new URL(anchor.href, location.href); if (url.origin === location.origin && url.pathname === '/start') capture('assessment_cta_clicked'); } catch {}
  });
  pageview();
})();
