import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import BannerSlider from '../components/BannerSlider'
import SEO from '../components/SEO'
import api from '../services/api'
import bannerImage from '../images/banner.jpeg'
import bannerImage2 from '../images/banner 2.jpeg'
import LittleVoicesSection from '../components/LittleVoicesSection'
import TestimonialsSection from '../components/TestimonialsSection'

const HOME_CACHE_KEY = 'wowmart_home_v1'
const HOME_CACHE_MAX_AGE_MS = 12 * 60 * 1000

const DEFAULT_SECTION_NAMES = {
  shopByCategory: 'Shop by Category',
  trendingCollections: 'Trending Collections',
  trendingToys: 'Trending Toys',
  trendingGadgets: 'Trending Gadgets',
  trendingBuildingSets: 'Trending Building Sets',
  featuredProducts: 'Featured Products',
  customerReviews: 'What Our Customers Say',
}

function readHomeCache() {
  try {
    const raw = sessionStorage.getItem(HOME_CACHE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o._ts || Date.now() - o._ts > HOME_CACHE_MAX_AGE_MS) return null
    return o
  } catch {
    return null
  }
}

function mergeHomeCache(patch) {
  try {
    let prev = {}
    try {
      const raw = sessionStorage.getItem(HOME_CACHE_KEY)
      if (raw) prev = JSON.parse(raw)
    } catch {
      prev = {}
    }
    const { _ts: _drop, ...rest } = prev
    sessionStorage.setItem(
      HOME_CACHE_KEY,
      JSON.stringify({ ...rest, ...patch, _ts: Date.now() })
    )
  } catch {
    /* ignore quota / private mode */
  }
}

const defaultFallbackBanners = (img1, img2) => [
  { src: img1, alt: 'Banner 1', linkUrl: '/products', buttonText: 'Shop Now' },
  { src: img2, alt: 'Banner 2', linkUrl: '/products', buttonText: 'Shop Now' },
]

function Home() {
  const cached = readHomeCache()
  const [featuredProducts, setFeaturedProducts] = useState(() => cached?.featuredProducts ?? [])
  const [trendingCollections, setTrendingCollections] = useState({})
  const [categories, setCategories] = useState(() => cached?.categories ?? [])
  const [categoriesLoaded, setCategoriesLoaded] = useState(
    () => Boolean(cached?.categories?.length)
  )
  const [banners, setBanners] = useState(() =>
    cached?.banners?.length
      ? cached.banners
      : defaultFallbackBanners(bannerImage, bannerImage2)
  )
  const [reviews, setReviews] = useState(() => cached?.reviews ?? [])
  const [featuredLoading, setFeaturedLoading] = useState(
    () =>
      !Array.isArray(cached?.featuredProducts) || cached.featuredProducts.length === 0
  )
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [touchStartY, setTouchStartY] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sectionNames, setSectionNames] = useState({
    ...DEFAULT_SECTION_NAMES,
    ...(cached?.sectionNames && typeof cached.sectionNames === 'object' ? cached.sectionNames : {}),
  })

  // Helper function to get full image URL (handles Cloudinary and local paths)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return ''
    // If it's already a full URL (Cloudinary, external, etc.), use it as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    // Otherwise, prepend the API base URL for local uploads
    const API_BASE = import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : 'https://wow-aovo.onrender.com'
    return `${API_BASE}${imageUrl}`
  }

  useEffect(() => {
    let cancelled = false

    const excludedCategorySlugs = ['toys', 'gadgets', 'building-sets', 'electronics', 'games']
    const filterCategories = (categoriesData) =>
      categoriesData.filter((category) => {
        const slug = category.categorySlug?.toLowerCase() || ''
        const name = category.name?.toLowerCase() || ''
        return !excludedCategorySlugs.some(
          (excluded) => slug.includes(excluded) || name.includes(excluded)
        )
      })

    const fallbackBanners = defaultFallbackBanners(bannerImage, bannerImage2)

    const featuredPromise = api
      .get('/products/featured/list?section=Featured Products')
      .then((res) => res.data)
      .catch(() => getFeaturedProducts())

    api
      .get('/settings/homepage-sections')
      .then((res) => {
        if (cancelled || !res?.data?.sections) return
        setSectionNames((prev) => ({ ...prev, ...res.data.sections }))
        mergeHomeCache({ sectionNames: res.data.sections })
      })
      .catch(() => {})

    api
      .get('/categories?homepage=true')
      .then((res) => {
        if (cancelled) return
        const categoriesData = res?.data || []
        const filtered = filterCategories(categoriesData)
        setCategories(filtered)
        setCategoriesLoaded(true)
        mergeHomeCache({ categories: filtered })
      })
      .catch(() => {
        if (!cancelled) setCategoriesLoaded(true)
      })

    api
      .get('/banners')
      .then((res) => {
        if (cancelled) return
        const bannersData = res?.data || []
        if (bannersData.length > 0) {
          const formattedBanners = bannersData.map((banner) => ({
            desktopImageUrl: banner.desktopImageUrl || banner.imageUrl,
            mobileImageUrl: banner.mobileImageUrl || banner.imageUrl,
            src: banner.imageUrl,
            alt: `Banner ${banner.order + 1}`,
            linkUrl: banner.linkUrl || '/products',
            buttonText: banner.buttonText || 'Shop Now',
            buttonColor: banner.buttonColor || undefined,
          }))
          setBanners(formattedBanners)
          mergeHomeCache({ banners: formattedBanners })
        } else {
          setBanners(fallbackBanners)
          mergeHomeCache({ banners: fallbackBanners })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBanners(fallbackBanners)
          mergeHomeCache({ banners: fallbackBanners })
        }
      })

    featuredPromise
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : []
        setFeaturedProducts(list)
        mergeHomeCache({ featuredProducts: list })
      })
      .catch(() => {
        if (!cancelled) {
          setFeaturedProducts([])
          mergeHomeCache({ featuredProducts: [] })
        }
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false)
      })

    api
      .get('/reviews/featured')
      .then((res) => {
        if (cancelled) return
        const rev = res?.data || []
        setReviews(rev)
        setCurrentReviewIndex(0)
        mergeHomeCache({ reviews: rev })
      })
      .catch(() => {})

    setTrendingCollections({})

    return () => {
      cancelled = true
    }
  }, [])

  // Auto-slide reviews carousel
  useEffect(() => {
    if (reviews.length <= 1) return
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }, 5000) // Auto-slide every 5 seconds
    return () => clearInterval(interval)
  }, [reviews.length])

  // Touch swipe handlers for mobile
  const minSwipeDistance = 50
  const [touchOffset, setTouchOffset] = useState(0)

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
    setIsDragging(true)
    setTouchOffset(0)
  }

  const onTouchMove = (e) => {
    if (touchStart !== null && touchStartY !== null) {
      const currentX = e.targetTouches[0].clientX
      const currentY = e.targetTouches[0].clientY
      const diffX = touchStart - currentX
      const diffY = touchStartY - currentY
      
      // Only apply horizontal offset if horizontal movement is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault() // Prevent vertical scroll during horizontal swipe
        setTouchOffset(diffX)
        setTouchEnd(currentX)
      }
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || touchEnd === null) {
      setIsDragging(false)
      setTouchOffset(0)
      setTouchStartY(null)
      return
    }
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && reviews.length > 0) {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    } else if (isRightSwipe && reviews.length > 0) {
      setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    }

    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
    setTouchStartY(null)
    setTouchOffset(0)
  }

  const goToNextReview = () => {
    if (reviews.length > 0) {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
    }
  }

  const goToPreviousReview = () => {
    if (reviews.length > 0) {
      setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    }
  }

  return (
    <div className="bg-transparent">
      <SEO
        title="wowmart - Toys & Gadgets for Kids & Teens"
        description="Discover amazing toys and gadgets for kids and teenagers. Safe, fun, and exciting products that kids love! Shop now for the best deals."
        image="/images/LOGO PNG B.png"
        type="website"
      />
      <section className="pt-6 pb-10 md:pt-10 md:pb-14">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <BannerSlider banners={banners} />
        </div>
      </section>

      <section className="py-14 md:py-20 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="mb-10 md:mb-14">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-2">
                {sectionNames.shopByCategory}
              </h2>
              <p className="text-slate-600 text-base md:text-lg">Find the right fit for every age.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {!categoriesLoaded && categories.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                    aria-hidden
                  >
                    <div className="w-full aspect-square rounded-xl bg-slate-100 border border-slate-100" />
                    <div className="mt-3 h-4 w-24 rounded bg-slate-100" />
                  </div>
                ))
              ) : categories.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-500 text-sm">
                  No categories available.
                </div>
              ) : (
                categories.map((category) => (
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
                    <h3 className="mt-3 font-display font-semibold text-slate-900 text-sm md:text-base text-center" style={category.textColor ? { color: category.textColor } : {}}>
                      {category.name}
                    </h3>
                  </div>
                ))
              )}
            </div>
            {categories.length > 0 && (
              <div className="text-center mt-8 md:mt-10">
                <Link
                  to="/categories"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold text-sm md:text-base px-6 py-3 rounded-full hover:bg-slate-800 transition-colors no-underline"
                >
                  View more categories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

        </div>  
      </section>

      <section className="py-14 md:py-20 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-2">
              {sectionNames.featuredProducts}
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
              Curated picks loved by parents and kids alike.
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Featured products are currently unavailable.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className="stagger-fade-in" 
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'backwards'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/products" className="btn-secondary inline-block">
              View all products
            </Link>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="py-14 md:py-20 bg-surface-muted/50">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-2">
                {sectionNames.customerReviews}
              </h2>
              <p className="text-slate-600 text-base">What our customers say</p>
            </div>

            <div className="relative w-full max-w-3xl mx-auto flex items-center gap-4">
              <button
                onClick={goToPreviousReview}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm flex-shrink-0 z-10"
                aria-label="Previous review"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Carousel Container */}
              <div 
                className="relative overflow-hidden rounded-xl w-full flex-1"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: 'pan-y pinch-zoom' }}
              >
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(calc(-${currentReviewIndex * 100}% + ${isDragging ? touchOffset : 0}px))`,
                    transitionDuration: isDragging ? '0ms' : '500ms',
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  {reviews.map((review) => (
                      <div key={review._id} className="bg-white rounded-xl border border-slate-200 p-5 flex-shrink-0 min-w-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-slate-700 font-semibold text-sm">
                          {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">{review.name || 'Anonymous'}</h4>
                        {review.age && <p className="text-xs text-slate-500">Age {review.age}</p>}
                      </div>
                    </div>
                    {review.product && typeof review.product === 'object' && review.product.images && review.product.images[0] && (
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name || 'Product'}
                        className="w-10 h-10 object-cover rounded-lg"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-500' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-2">
                    "{review.comment}"
                  </p>

                  {review.product && (
                    <Link
                      to={`/products/${typeof review.product === 'object' ? (review.product._id || review.product) : review.product}`}
                      className="text-sm text-primary-yellow hover:text-amber-600 font-medium"
                    >
                      View product →
                    </Link>
                  )}

                  {review.verified && (
                    <div className="mt-2 flex items-center text-xs text-emerald-600">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Purchase
                    </div>
                  )}
                      </div>
                  ))}
                </div>
              </div>

              <button
                onClick={goToNextReview}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm flex-shrink-0 z-10"
                aria-label="Next review"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      <TestimonialsSection />
      <LittleVoicesSection/>

      <section className="py-14 md:py-20 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl text-center">
          <h2 className="font-display text-display-sm md:text-display-md font-semibold text-slate-900 mb-3">
            Ready to shop?
          </h2>
          <p className="text-slate-600 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Browse our full catalog of toys and gadgets for every age.
          </p>
          <Link to="/products" className="btn-primary inline-block">
            Browse products
          </Link>
        </div>
      </section> 
    </div>
  )
}

export default Home
