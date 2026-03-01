import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
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
        const defaultCategories = []
        
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
    ? `${categoryName} - Products | wowmart`
    : filters.search 
    ? `Search: ${filters.search} | wowmart`
    : 'Products | wowmart';
  const pageDescription = categoryName
    ? `Browse our collection of ${categoryName.toLowerCase()} for kids and teens. Safe, fun, and exciting products!`
    : filters.search
    ? `Search results for "${filters.search}" on wowmart`
    : 'Browse our complete catalog of toys and gadgets for kids and teenagers. Find the perfect gift!';

  return (
    <div className="min-h-screen bg-surface-subtle pt-6 pb-12 md:pt-10 md:pb-16">
      <SEO title={pageTitle} description={pageDescription} image="/images/LOGO PNG B.png" type="website" />
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-1">Products</h1>
          <p className="text-slate-600 text-base">Browse our catalog</p>
          {products.length > 0 && (
            <p className="text-slate-500 text-sm mt-2">{products.length} {products.length === 1 ? 'product' : 'products'}</p>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 pl-11 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-white text-slate-700 px-4 py-3 rounded-xl font-medium text-sm border border-slate-200 hover:bg-slate-50 min-h-[44px]"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {(filters.category || filters.sort) && (
                <span className="bg-slate-900 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {[filters.category, filters.sort].filter(Boolean).length}
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
        <div className={`lg:hidden overflow-hidden transition-all duration-200 ${isFilterOpen ? 'max-h-[400px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="mb-4">
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
              >
                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
              >
                <option value="">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Highest rated</option>
              </select>
            </div>
            {(filters.category || filters.sort) && (
              <button
                onClick={() => { setFilters({ ...filters, category: '', sort: '' }); setSearchParams({ ...filters, category: '', sort: '' }) }}
                className="w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:block bg-white rounded-xl p-5 mb-8 border border-slate-200">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
              >
                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 text-sm">Sort by</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow/30 focus:border-primary-yellow bg-white"
              >
                <option value="">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Highest rated</option>
              </select>
            </div>
            <div className="flex items-end">
              {(filters.category || filters.sort) && (
                <button
                  onClick={() => { setFilters({ ...filters, category: '', sort: '' }); setSearchParams({ ...filters, category: '', sort: '' }) }}
                  className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-600">No products match your filters. Try adjusting them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
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
