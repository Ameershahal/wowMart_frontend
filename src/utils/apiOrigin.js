/**
 * Single source of truth for API base + public origin (Render, AWS, local, etc.).
 * Set `VITE_API_URL` in production (e.g. https://wow-aovo.onrender.com/api).
 * Optional: `VITE_API_ORIGIN` if static files are served from a different host than the API.
 * Dev: `VITE_DEV_API_URL` overrides default http://localhost:5001/api
 */

function stripTrailingSlash(s) {
  return s.replace(/\/$/, '')
}

const DEFAULT_PROD_API = 'https://wow-aovo.onrender.com/api'
const DEFAULT_DEV_API = 'http://localhost:5001/api'

/** Same base used by axios in `src/services/api.js` */
export function getApiBaseUrl() {
  if (import.meta.env.DEV) {
    return stripTrailingSlash(import.meta.env.VITE_DEV_API_URL || DEFAULT_DEV_API)
  }
  return stripTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_PROD_API)
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
    return import.meta.env.DEV ? 'http://localhost:5001' : 'https://wow-aovo.onrender.com'
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
