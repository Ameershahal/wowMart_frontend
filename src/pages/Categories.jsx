import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import SEO from '../components/SEO'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
    const base = import.meta.env.DEV ? 'http://localhost:5001' : 'https://wow-bhyw.onrender.com'
    return `${base}${imageUrl}`
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        setCategories(response.data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-surface-subtle">
      <SEO title="All Categories" description="Browse all product categories" />
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-10 md:mb-14">
            <h1 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-2">
              All Categories
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              Browse by category to find what you need.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              No categories available.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
              {categories.map((category) => (
                <div key={category._id} className="flex flex-col items-center">
                  <Link
                    to={`/products?category=${category.categorySlug}`}
                    className="group block w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-slate-300 hover:shadow-card-hover transition-all duration-200"
                    style={{ backgroundColor: category.backgroundColor || undefined }}
                  >
                    <img
                      src={getImageUrl(category.imageUrl)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400' }}
                    />
                  </Link>
                  <h2 className="mt-3 font-display font-semibold text-slate-900 text-sm md:text-base text-center" style={category.textColor ? { color: category.textColor } : {}}>
                    {category.name}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Categories
