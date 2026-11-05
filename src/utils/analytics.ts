const SITE_HOSTNAME = 'float.gilla.fun';
const UMAMI_WEBSITE_ID = '9172b5be-7a8d-4b48-8bd9-e6e05913c299';

/**
 * Loads Umami through the site's own /_s proxy (functions/_s). Only the public site counts: the Mac app, local dev,
 * and Pages preview deployments have other hostnames and never load the tracker.
 */
export function loadAnalytics(): void {
  if (typeof window === 'undefined' || window.location.hostname !== SITE_HOSTNAME) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_s/f.js';
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.hostUrl = `${window.location.origin}/_s`;
  script.dataset.doNotTrack = 'true';
  document.head.appendChild(script);
}
