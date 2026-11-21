/**
 * Navigation & Hash-Routing Utilities for Microbledle & WikiMicrobe
 * 
 * Provides unified, 100% GitHub Pages zero-404 compatible routing
 * with deep linking and native browser history / gesture support.
 */

export function parseHashRoute(hashStr = (typeof window !== 'undefined' ? window.location.hash : '')) {
  const clean = (hashStr || '').replace(/^#\/?/, '').trim();
  if (!clean) {
    return {
      raw: '',
      route: 'menu',
      params: new URLSearchParams(),
      date: null,
      id: null,
      chapter: null
    };
  }

  const [routePart, queryPart] = clean.split('?');
  const normalizedRoute = (routePart || '').toLowerCase().trim();
  const params = new URLSearchParams(queryPart || '');

  // Route alias harmonization
  let route = normalizedRoute;
  if (route === 'library') route = 'wikimicrobe';
  if (route === 'archive') route = 'daily';
  if (!route) route = 'menu';

  const chParam = params.get('ch') || params.get('chapter');
  const chapter = chParam ? parseInt(chParam, 10) : null;

  return {
    raw: clean,
    route,
    params,
    date: params.get('date'),
    id: params.get('id') || params.get('bug'),
    chapter: isNaN(chapter) ? null : chapter
  };
}

export function buildHash(route, params = {}) {
  let r = (route || 'menu').toLowerCase();
  if (r === 'library') r = 'wikimicrobe';

  const searchParams = new URLSearchParams();
  if (params.date) searchParams.set('date', params.date);
  if (params.id) searchParams.set('id', params.id);
  if (params.bug && !params.id) searchParams.set('id', params.bug);
  if (params.ch !== undefined && params.ch !== null) searchParams.set('ch', params.ch);

  const query = searchParams.toString();
  if (r === 'menu') {
    return query ? `#menu?${query}` : '#menu';
  }
  return query ? `#${r}?${query}` : `#${r}`;
}

export function navigateToHash(route, params = {}) {
  if (typeof window === 'undefined') return;
  const hash = buildHash(route, params);
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}
