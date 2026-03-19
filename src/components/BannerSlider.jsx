import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useButtonColor } from '../hooks/useButtonColor'

function BannerSlider({ banners = [] }) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { buttonColor } = useButtonColor()

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Helper function to get full image URL
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
    if (banners.length <= 1) return

    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000) // Auto-slide every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length])


  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  if (!banners || banners.length === 0) {
    return null
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Banner Container */}
      <div className="relative overflow-hidden rounded-lg shadow-lg w-full md:h-auto">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / banners.length)}%)`,
            width: `${banners.length * 100}%`
          }}
        >
          {banners.map((banner, index) => (
            <div 
              key={index} 
              className="relative"
              style={{ 
                width: `${100 / banners.length}%`,
                flexShrink: 0
              }}
            >
              {/* Desktop Image */}
              <img
                src={getImageUrl(banner.desktopImageUrl || banner.imageUrl)}
                alt={banner.alt || `Banner ${index + 1}`}
                className="hidden md:block w-full h-auto object-contain"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              {/* Mobile Image */}
              <img
                src={getImageUrl(banner.mobileImageUrl || banner.imageUrl)}
                alt={banner.alt || `Banner ${index + 1}`}
                className="block md:hidden w-full h-auto object-contain"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              {/* CTA Button - Each banner has its own button that slides with the image */}
              <div className="absolute inset-0 flex items-center justify-center translate-y-6 md:translate-y-0 lg:items-end lg:justify-start z-10 lg:left-20 bottom-20 pointer-events-none">
                <button
                  onClick={() => {
                    const linkUrl = banner.linkUrl || '/products'
                    if (linkUrl.startsWith('http')) {
                      window.open(linkUrl, '_blank')
                    } else {
                      navigate(linkUrl)
                    }
                  }}
                  type="button"
                  className="pointer-events-auto mt-8 md:mt-0 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-wide text-sm md:text-base"
                  style={{
                    backgroundColor: banner.buttonColor || buttonColor,
                    border: 'none',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    const bannerButtonColor = banner.buttonColor || buttonColor
                    const rgb = hexToRgb(bannerButtonColor)
                    if (rgb) {
                      e.target.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = banner.buttonColor || buttonColor
                  }}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {banner.buttonText || 'Shop Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center items-center mt-1.5" style={{ gap: '4px' }}>
          {banners.map((_, index) => (
            <div
              key={index}
              onClick={() => goToSlide(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goToSlide(index)
                }
              }}
              className="cursor-pointer transition-all duration-200"
              style={{
                width: index === currentIndex ? '10px' : '11px',
                height: index === currentIndex ? '10px' : '12px',
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? '#000000' : '#9ca3af',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                padding: '0',
                margin: '0',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.target.style.backgroundColor = '#6b7280'
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.target.style.backgroundColor = '#9ca3af'
                }
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerSlider
