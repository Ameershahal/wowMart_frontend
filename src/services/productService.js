import api from './api'
import cache from '../utils/cache'

/** Must stay in sync with backend `PRODUCT_CATALOG_MAX` / default catalog cap (store listing). */
const DEFAULT_CATALOG_LIMIT = 10000

export const getProducts = async (filters = {}) => {
  // Create cache key from filters
  const cacheKey = `products_${JSON.stringify(filters)}`
  
  // Check cache first (only for non-search queries to keep results fresh)
  if (!filters.search) {
    const cached = cache.get(cacheKey)
    if (cached) {
      return cached
    }
  }
  
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.search) params.append('search', filters.search)
  if (filters.sort) params.append('sort', filters.sort)
  if (filters.homePageSection) params.append('homePageSection', filters.homePageSection)
  const limit =
    filters.limit != null && filters.limit !== ''
      ? filters.limit
      : DEFAULT_CATALOG_LIMIT
  params.append('limit', String(limit))
  
  const response = await api.get(`/products?${params.toString()}`)
  
  // Cache non-search results for 2 minutes
  if (!filters.search) {
    cache.set(cacheKey, response.data, 2 * 60 * 1000)
  }
  
  return response.data
}

export const getProduct = async (id) => {
  const cacheKey = `product_${id}`
  
  // Check cache
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const response = await api.get(`/products/${id}`)
  
  // Cache for 5 minutes
  cache.set(cacheKey, response.data, 5 * 60 * 1000)
  
  return response.data
}

export const getFeaturedProducts = async () => {
  const cacheKey = 'featured_products'
  
  // Check cache
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const response = await api.get('/products/featured/list')
  
  // Cache for 3 minutes
  cache.set(cacheKey, response.data, 3 * 60 * 1000)
  
  return response.data
}
