import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts, getProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import BannerSlider from '../components/BannerSlider'
import SEO from '../components/SEO'
import api from '../services/api'
import bannerImage from '../images/banner.jpeg'
import bannerImage2 from '../images/banner 2.jpeg'
import LittleVoicesSection from '../components/LittleVoicesSection'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [trendingCollections, setTrendingCollections] = useState({})
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [touchStartY, setTouchStartY] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sectionNames, setSectionNames] = useState({
    shopByCategory: 'Shop by Category',
    trendingCollections: 'Trending Collections',
    trendingToys: 'Trending Toys',
    trendingGadgets: 'Trending Gadgets',
    trendingBuildingSets: 'Trending Building Sets',
    featuredProducts: 'Featured Products',
    customerReviews: 'What Our Customers Say'
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
      : 'https://wowmart-h0ky.onrender.com'
    return `${API_BASE}${imageUrl}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch section names
        try {
          const sectionsResponse = await api.get('/settings/homepage-sections')
          if (sectionsResponse.data.sections) {
            setSectionNames(sectionsResponse.data.sections)
          }
        } catch (sectionError) {
          console.error('Error fetching section names:', sectionError)
          // Use defaults if API fails
        }

        // Fetch categories for homepage (only those marked to show on homepage, limit 4)
        const categoriesResponse = await api.get('/categories?homepage=true')
        setCategories(categoriesResponse.data || [])
        
        // Fetch active banners
        try {
          const bannersResponse = await api.get('/banners')
          if (bannersResponse.data && bannersResponse.data.length > 0) {
            const formattedBanners = bannersResponse.data.map(banner => ({
              desktopImageUrl: banner.desktopImageUrl || banner.imageUrl,
              mobileImageUrl: banner.mobileImageUrl || banner.imageUrl,
              src: banner.imageUrl, // Fallback
              alt: `Banner ${banner.order + 1}`,
              linkUrl: banner.linkUrl || '/products',
              buttonText: banner.buttonText || 'Shop Now',
              buttonColor: banner.buttonColor || undefined
            }))
            setBanners(formattedBanners)
          } else {
            // Fallback to default banners if no banners found
            setBanners([
              { src: bannerImage, alt: 'Banner 1', linkUrl: '/products', buttonText: 'Shop Now' },
              { src: bannerImage2, alt: 'Banner 2', linkUrl: '/products', buttonText: 'Shop Now' }
            ])
          }
        } catch (bannerError) {
          console.error('Error fetching banners:', bannerError)
          // Fallback to default banners on error
          setBanners([
            { src: bannerImage, alt: 'Banner 1', linkUrl: '/products', buttonText: 'Shop Now' },
            { src: bannerImage2, alt: 'Banner 2', linkUrl: '/products', buttonText: 'Shop Now' }
          ])
        }
        
        // Fetch products for trending collections with limits to reduce data transfer
        // Filter by homePageSections if set, otherwise show all products in category (backward compatible)
        const [featured, toys, gadgets, buildingSets] = await Promise.all([
          api.get('/products/featured/list?section=Featured Products').then(res => res.data).catch(() => api.get('/products/featured/list').then(res => res.data)),
          getProducts({ category: 'toys', homePageSection: 'Trending Toys', limit: 4 }),
          getProducts({ category: 'gadgets', homePageSection: 'Trending Gadgets', limit: 4 }),
          getProducts({ category: 'building-sets', homePageSection: 'Trending Building Sets', limit: 4 })
        ])
        
        setFeaturedProducts(featured)
        setTrendingCollections({
          toys: toys.slice(0, 4),
          gadgets: gadgets.slice(0, 4),
          buildingSets: buildingSets.slice(0, 4)
        })

        // Fetch featured reviews
        try {
          const reviewsResponse = await api.get('/reviews/featured')
          setReviews(reviewsResponse.data || [])
          setCurrentReviewIndex(0) // Reset to first review when reviews are fetched
        } catch (reviewError) {
          console.error('Error fetching reviews:', reviewError)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
        title="WowMart - Toys & Gadgets for Kids & Teens"
        description="Discover amazing toys and gadgets for kids and teenagers. Safe, fun, and exciting products that kids love! Shop now for the best deals."
        image="/images/LOGO PNG B.png"
        type="website"
      />
      {/* Banner Section */}
      <section className="bg-transparent pt-6 pb-8 md:pt-8 md:pb-12">
        <div className="container mx-auto px-4">
          <BannerSlider banners={banners} />
        </div>
      </section>

      {/* Categories & Trending Collections Section */}
      <section className="py-8 md:py-16 bg-transparent">
        <div className="container mx-auto px-4">
          {/* Categories */}
          <div className="mb-8 md:mb-16">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black mb-2 md:mb-4">
                {sectionNames.shopByCategory}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">Find your perfect match!</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {categories.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No categories available. Add categories from the admin panel.
                </div>
              ) : (
                categories.map((category, index) => (
                  <div key={category._id} className="flex flex-col items-center bg-yellow-50/30 rounded-lg p-4 hover:bg-yellow-50/50 transition-colors">
              <Link
                      to={`/products?category=${category.categorySlug}`}
                      className="group relative w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
                      style={{
                        backgroundColor: category.backgroundColor || '#fef3c7'
                      }}
                    >
                      <img
                        src={getImageUrl(category.imageUrl)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400'
                        }}
                      />
              </Link>
                    <h3 
                      className="mt-3 md:mt-4 text-base sm:text-lg md:text-xl font-bold text-center"
                      style={{
                        color: category.textColor || '#ef4444',
                        background: !category.textColor 
                          ? 'linear-gradient(to right, #ef4444, #f97316)'
                          : 'none',
                        WebkitBackgroundClip: !category.textColor ? 'text' : 'unset',
                        WebkitTextFillColor: !category.textColor ? 'transparent' : 'unset',
                        backgroundClip: !category.textColor ? 'text' : 'unset'
                      }}
                    >
                      {category.name}
                    </h3>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Trending Collections */}
          <div>
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black mb-2 md:mb-4">
                {sectionNames.trendingCollections}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
                Everyone's talking about these! 
                <span className="text-red-600 font-bold ml-2">Top picks by {Math.floor(Math.random() * 300) + 500} kids this week!</span>
              </p>
            </div>

            {/* Trending Toys */}
            {trendingCollections.toys && trendingCollections.toys.length > 0 && (
              <div className="mb-8 md:mb-16">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black">{sectionNames.trendingToys}</h3>
                  <Link
                    to="/products?category=toys&sort=rating"
                    className="text-black font-bold hover:text-yellow-400 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    See More!
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {trendingCollections.toys.map((product, index) => (
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
              </div>
            )}

            {/* Trending Gadgets */}
            {trendingCollections.gadgets && trendingCollections.gadgets.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black">{sectionNames.trendingGadgets}</h3>
                  <Link
                    to="/products?category=gadgets&sort=rating"
                    className="text-black font-bold hover:text-yellow-400 transition-colors flex items-center gap-2"
                  >
                    View All
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingCollections.gadgets.map((product, index) => (
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
              </div>
            )}

            {/* Trending Building Sets */}
            {trendingCollections.buildingSets && trendingCollections.buildingSets.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-black">{sectionNames.trendingBuildingSets}</h3>
                  <Link
                    to="/products?category=building-sets&sort=rating"
                    className="text-black font-bold hover:text-yellow-400 transition-colors flex items-center gap-2"
                  >
                    View All
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingCollections.buildingSets.map((product, index) => (
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
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center bg-blue-50/20 rounded-lg p-6">
              <div className="bg-yellow-400 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-black mb-1 md:mb-2">Safe & Quality</h3>
              <p className="text-sm sm:text-base text-gray-600">Tested and super safe!</p>
            </div>
            <div className="text-center bg-green-50/20 rounded-lg p-6">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Super quick delivery!</p>
            </div>
            <div className="text-center bg-purple-50/20 rounded-lg p-6">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Best Prices</h3>
              <p className="text-gray-600">Awesome deals you'll love!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black mb-2 md:mb-4">
                {sectionNames.featuredProducts}
              </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
              Our absolute favorites - kids love 'em! 
              <span className="text-yellow-600 font-bold ml-2">{Math.floor(Math.random() * 500) + 1000}+ happy kids bought these!</span>
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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

          <div className="text-center mt-6 md:mt-12">
            <Link to="/products" className="btn-secondary text-sm sm:text-base md:text-lg px-6 py-3 md:px-8 md:py-4 inline-block">
              Show Me Everything!
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-12 md:py-16 bg-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                {sectionNames.customerReviews}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Real reviews from happy customers
              </p>
            </div>

            <div className="relative w-full max-w-3xl mx-auto flex items-center gap-4">
              {/* Previous Arrow - Desktop Only */}
              <button
                onClick={goToPreviousReview}
                className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-yellow-400 text-gray-700 hover:text-yellow-600 transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0 z-10"
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
                  {reviews.map((review, index) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
                        style={{
                          width: '100%',
                          flexShrink: 0,
                          minWidth: '100%'
                        }}
                      >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
                          {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {review.name || 'Anonymous'}
                        </h4>
                        {review.age && (
                          <p className="text-xs text-gray-500">Age {review.age}</p>
                        )}
                      </div>
                    </div>
                    {review.product && typeof review.product === 'object' && review.product.images && review.product.images[0] && (
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name || 'Product'}
                        className="w-10 h-10 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>

                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-gray-700 text-xs leading-relaxed mb-2">
                    "{review.comment}"
                  </p>

                  {review.product && (
                    <Link
                      to={`/products/${typeof review.product === 'object' ? (review.product._id || review.product) : review.product}`}
                      className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      View Product →
                    </Link>
                  )}

                  {review.verified && (
                    <div className="mt-2 flex items-center text-xs text-green-600">
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

              {/* Next Arrow - Desktop Only */}
              <button
                onClick={goToNextReview}
                className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-yellow-400 text-gray-700 hover:text-yellow-600 transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0 z-10"
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

      <LittleVoicesSection/>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gray-50/30 text-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-4 md:mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-4 md:mb-6 max-w-2xl mx-auto px-2">
            Join <span className="text-yellow-400 font-bold">{Math.floor(Math.random() * 5000) + 10000}+</span> happy kids and parents who trust WowMart!
          </p>
          <div className="bg-yellow-400/10 rounded-lg p-3 mb-6 max-w-xl mx-auto border border-yellow-400/20">
            <p className="text-gray-800 font-bold text-sm sm:text-base">
              FREE Shipping over $50! Flash Sale ends soon!
            </p>
          </div>
          <Link to="/products" className="btn-primary text-sm sm:text-base md:text-lg px-6 py-3 md:px-8 md:py-4 inline-block bg-yellow-400 hover:bg-yellow-500 transform hover:scale-110">
            Let's Shop! {Math.floor(Math.random() * 100) + 200} kids shopping now!
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
