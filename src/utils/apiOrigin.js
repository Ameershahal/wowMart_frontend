/**
 * Single source of truth for API base + public origin (Render, AWS, local, etc.).
 * Set `VITE_API_URL` in production (e.g. https://wow-aovo.onrender.com/api).
 * Optional: `VITE_API_ORIGIN` if static files are served from a different host than the API.
 * Dev: `VITE_DEV_API_URL` overrides default http://localhost:5001/api
 */

function stripTrailingSlash(s) {
  return s.replace(/\/$/, '')
}

let activeApiUrl = null;
let checkPromise = null;

function formatApiUrl(url) {
  if (!url) return '';
  let cleaned = stripTrailingSlash(url);
  if (!cleaned.endsWith('/api') && !cleaned.includes('/api/')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
}

export function getFallbackDevUrl() {
  const devUrl = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEV_API_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_DEV_API_URL) ||
    'http://localhost:5001/api';
  return formatApiUrl(devUrl);
}

/** Same base used by axios in `src/services/api.js` */
export function getApiBaseUrl() {
  if (activeApiUrl) {
    return activeApiUrl;
  }
  const prodUrl = 
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL);
    
  if (prodUrl) {
    return formatApiUrl(prodUrl);
  }
  return getFallbackDevUrl();
}

export function setActiveApiUrl(url) {
  activeApiUrl = formatApiUrl(url);
}

/**
 * Checks if the production server is reachable.
 * Resolves to the production URL if reachable, or the fallback localhost URL if unreachable.
 */
export async function checkProductionReachable() {
  if (checkPromise) return checkPromise;

  checkPromise = (async () => {
    const prodUrl = getApiBaseUrl();
    const fallbackUrl = getFallbackDevUrl();

    if (prodUrl === fallbackUrl) {
      activeApiUrl = prodUrl;
      return prodUrl;
    }

    try {
      const rootUrl = prodUrl.endsWith('/api') ? prodUrl.slice(0, -4) : prodUrl;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

      await fetch(rootUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      activeApiUrl = prodUrl;
      return prodUrl;
    } catch (err) {
      console.warn("Production backend is not reachable. Falling back to localhost/dev API.", err);
      activeApiUrl = fallbackUrl;
      return fallbackUrl;
    }
  })();

  return checkPromise;
}

// Start checking immediately when the bundle loads to minimize latency
if (typeof window !== 'undefined') {
  checkProductionReachable();
}

/**
 * Origin for resolving `/uploads/...` paths (no `/api` suffix).
 */
export function getPublicApiOrigin() {
  const explicit = import.meta.env.VITE_API_ORIGIN
  if (explicit && typeof explicit === 'string' && explicit.trim()) {
    return stripTrailingSlash(explicit.trim())
  }

  const base = getApiBaseUrl()
  if (base.endsWith('/api')) {
    const withoutApi = base.slice(0, -4)
    try {
      const parsed = new URL(withoutApi.startsWith('http') ? withoutApi : `https://${withoutApi}`)
      return `${parsed.protocol}//${parsed.host}`
    } catch {
      return withoutApi
    }
  }
  try {
    const parsed = new URL(base.startsWith('http') ? base : `https://${base}`)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return base;
  }
}

/**
 * Product / upload images from API (`/uploads/...` or full Cloudinary URL).
 * Leaves site static assets (`/images/...`, `/placeholder.jpg`) as-is for the browser.
 */
export function resolveMediaUrl(url) {
  if (url == null || url === '') return ''
  const u = String(url).trim()
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  if (u.startsWith('data:') || u.startsWith('blob:')) return u
  if (u.startsWith('/uploads') || u.startsWith('uploads/')) {
    const path = u.startsWith('/') ? u : `/${u}`
    return `${getPublicApiOrigin()}${path}`
  }
  if (!u.startsWith('/') && u.includes('uploads')) {
    return `${getPublicApiOrigin()}/${u.replace(/^\/+/, '')}`
  }
  return u
}
