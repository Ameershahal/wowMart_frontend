import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import SEO from '../components/SEO'
import api from '../services/api'

function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || ''
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const data = await getProducts(filters)
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [filters])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        const categoryList = response.data || []
        
        // Combine admin categories with default categories
        const defaultCategories = [
    { value: 'gadgets', label: 'Gadgets' },
    { value: 'building-sets', label: 'Building Sets' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'games', label: 'Games' }
  ]
        
        // Get admin category slugs to avoid duplicates
        const adminCategorySlugs = new Set(categoryList.map(cat => cat.categorySlug))
        
        // Filter out default categories that exist in admin categories
        const uniqueDefaultCategories = defaultCategories.filter(
          cat => !adminCategorySlugs.has(cat.value)
        )
        
        setCategories([
          { value: '', label: 'All Categories' },
          ...categoryList.map(cat => ({
            value: cat.categorySlug,
            label: cat.name
          })),
          ...uniqueDefaultCategories
        ])
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to default categories if API fails
        setCategories([
          { value: '', label: 'All Categories' },
          { value: 'toys', label: 'Toys' },
          { value: 'gadgets', label: 'Gadgets' },
          { value: 'building-sets', label: 'Building Sets' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'games', label: 'Games' }
        ])
      }
    }
    fetchCategories()
  }, [])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setSearchParams(newFilters)
  }



  const categoryName = categories.find(c => c.categorySlug === filters.category)?.name || '';
  const pageTitle = categoryName 
    ? `${categoryName} - Products | WowMart`
    : filters.search 
    ? `Search: ${filters.search} | WowMart`
    : 'Products | WowMart';
  const pageDescription = categoryName
    ? `Browse our collection of ${categoryName.toLowerCase()} for kids and teens. Safe, fun, and exciting products!`
    : filters.search
    ? `Search results for "${filters.search}" on WowMart`
    : 'Browse our complete catalog of toys and gadgets for kids and teenagers. Find the perfect gift!';

  return (
    <div className="bg-gradient-to-b from-white via-yellow-50/10 to-white min-h-screen pt-4 pb-4 sm:pt-6 sm:pb-6 md:pt-10 md:pb-8">
      <SEO
        title={pageTitle}
        description={pageDescription}
        image="/images/LOGO PNG B.png"
        type="website"
      />
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-5 sm:mb-6 md:mb-10">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Products</h1>
            <p className="text-base sm:text-base text-gray-600">Browse our complete catalog</p>
          </div>
          {products.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            </div>
          )}
        </div>

        {/* Search Bar - Always Visible */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 pl-12 text-base rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-white text-gray-700 px-3 xs:px-4 py-3 xs:py-3.5 rounded-xl font-medium text-sm xs:text-base shadow-sm border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 touch-target min-h-[44px] xs:min-h-[48px]"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {(filters.category || filters.ageRange || filters.sort) && (
                <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                  {[filters.category, filters.ageRange, filters.sort].filter(Boolean).length}
                </span>
              )}
            </div>
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
          isFilterOpen ? 'max-h-[600px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'
        }`}>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            {/* Category */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
              >
                <option value="">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(filters.category || filters.ageRange || filters.sort) && (
              <button
                onClick={() => {
                  setFilters({ ...filters, category: '', ageRange: '', sort: '' })
                  setSearchParams({ ...filters, category: '', ageRange: '', sort: '' })
                }}
                className="w-full mt-2 px-3 xs:px-4 py-2.5 xs:py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-xs xs:text-sm hover:bg-gray-200 transition-all duration-200 min-h-[44px] xs:min-h-[44px] touch-target"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filters - Always Visible */}
        <div className="hidden lg:block bg-white rounded-lg p-5 mb-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
              >
                <option value="">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Clear Filters - Desktop */}
            <div className="flex items-end">
              {(filters.category || filters.ageRange || filters.sort) && (
                <button
                  onClick={() => {
                    setFilters({ ...filters, category: '', ageRange: '', sort: '' })
                    setSearchParams({ ...filters, category: '', ageRange: '', sort: '' })
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12 md:py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-yellow-400"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 px-4">Oops! Nothing here. Try different filters!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="stagger-fade-in"
                style={{
                  animationDelay: `${index * 0.08}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
