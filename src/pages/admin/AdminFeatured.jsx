import { useState, useEffect } from 'react'
import api from '../../services/api'
import cache from '../../utils/cache'
import { resolveMediaUrl } from '../../utils/apiOrigin.js'

function AdminFeatured() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  
  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const limit = 24 // 24 products per page fits a 2, 3, or 4 column grid perfectly

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 on new search
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch products when page or debounced query changes
  useEffect(() => {
    fetchProducts(currentPage, debouncedSearch)
  }, [currentPage, debouncedSearch])

  const fetchProducts = async (page = currentPage, search = debouncedSearch) => {
    setTableLoading(true)
    try {
      const response = await api.get(`/admin/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      const payload = response.data
      if (Array.isArray(payload)) {
        setProducts(payload)
        setTotalPages(1)
        setTotalProducts(payload.length)
      } else {
        const items = Array.isArray(payload?.items) ? payload.items : []
        setProducts(items)
        setTotalPages(Number(payload?.totalPages) || 1)
        setTotalProducts(Number(payload?.total) || 0)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setTableLoading(false)
    }
  }

  const handleToggleFeatured = async (product) => {
    if (updatingId) return
    setUpdatingId(product._id)
    
    try {
      // 1. Fetch full product details to ensure schema compliance
      const res = await api.get(`/admin/products/${product._id}`)
      const fullProduct = res.data
      
      // 2. Modify homePageSections
      let sections = fullProduct.homePageSections || []
      const isFeatured = sections.includes('Featured Products')
      
      if (isFeatured) {
        sections = sections.filter(s => s !== 'Featured Products')
      } else {
        sections = [...sections, 'Featured Products']
      }
      
      // 3. Build complete product payload
      const payload = {
        name: fullProduct.name,
        description: fullProduct.description,
        detailedDescription: fullProduct.detailedDescription || fullProduct.description,
        price: fullProduct.price,
        originalPrice: fullProduct.originalPrice || fullProduct.price,
        category: fullProduct.category,
        stockQuantity: fullProduct.stockQuantity || 0,
        images: fullProduct.images || [],
        rating: fullProduct.rating || 0,
        reviewCount: fullProduct.reviewCount || 0,
        homePageSections: sections,
        freeShipping: fullProduct.freeShipping !== undefined ? Boolean(fullProduct.freeShipping) : true,
        returnDays: fullProduct.returnDays ? parseInt(fullProduct.returnDays) || 30 : 30,
        shippingCharge: fullProduct.shippingCharge ? parseFloat(fullProduct.shippingCharge) || 0 : 0,
        weight: fullProduct.weight ? parseFloat(fullProduct.weight) || 0 : 0,
        codAvailable: fullProduct.codAvailable !== undefined ? Boolean(fullProduct.codAvailable) : false,
        colors: Array.isArray(fullProduct.colors) ? fullProduct.colors : []
      }
      
      // 4. Send updates
      await api.put(`/admin/products/${product._id}`, payload)
      
      // 5. Update local state
      setProducts(prev =>
        prev.map(p =>
          p._id === product._id ? { ...p, homePageSections: sections } : p
        )
      )
      
      // 6. Clear front-end cache
      cache.delete(`product_${product._id}`)
      cache.clear()
      
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert(error.response?.data?.message || 'Error updating product')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-6">
      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black mb-1">Featured Products Manager</h1>
        <p className="text-sm text-gray-500">
          Toggle products to feature them on the homepage. Featured items are marked with a gold star badge.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search products by name or category..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-black"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid of products */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400"></div>
        </div>
      ) : (
        <div className="relative">
          {/* Dynamic Loading Bar */}
          {tableLoading && (
            <div className="absolute -top-3 left-0 right-0 h-0.5 bg-yellow-100 overflow-hidden z-10 rounded-full">
              <div className="h-full bg-yellow-400 animate-[pulse_1s_infinite]"></div>
            </div>
          )}

          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6 ${
            tableLoading ? 'opacity-60 transition-opacity duration-150' : 'transition-opacity duration-150'
          }`}>
            {products.map((product) => {
              const isFeatured = (product.homePageSections || []).includes('Featured Products')
              const isUpdating = updatingId === product._id

              return (
                <div 
                  key={product._id} 
                  className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isFeatured 
                      ? 'border-yellow-400 shadow-md ring-2 ring-yellow-400/20' 
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="relative pt-[100%] bg-gray-50 border-b border-gray-100">
                    {product.images && product.images[0] ? (
                      <img
                        src={resolveMediaUrl(product.images[0])}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    
                    {/* Star Badge for Featured items */}
                    {isFeatured && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-sm uppercase tracking-wide">
                        <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="mb-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 mb-2">
                        {product.category}
                      </span>
                      <h3 className="font-semibold text-sm text-black line-clamp-2" title={product.name}>
                        {product.name}
                      </h3>
                      <div className="text-sm font-bold text-black mt-1.5">
                        ₹{product.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Show on landing page</span>
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        disabled={isUpdating}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          isFeatured ? 'bg-yellow-400' : 'bg-gray-200'
                        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                        aria-label="Toggle homepage section"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                            isFeatured ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">No products found</p>
            </div>
          )}

          {/* Pagination Navigator */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-700">
                    Showing <span className="font-semibold">{Math.min(totalProducts, (currentPage - 1) * limit + 1)}</span> to{' '}
                    <span className="font-semibold">{Math.min(totalProducts, currentPage * limit)}</span> of{' '}
                    <span className="font-semibold">{totalProducts}</span> products
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="First Page"
                    >
                      <span className="sr-only">First</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous Page"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage;
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                          className={`relative inline-flex items-center px-3.5 py-2 border text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'z-10 bg-yellow-400 border-yellow-400 text-black font-semibold'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next Page"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Last Page"
                    >
                      <span className="sr-only">Last</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminFeatured
