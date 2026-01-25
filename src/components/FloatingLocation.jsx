import { useState } from 'react'

function FloatingLocation() {
  const [isHovered, setIsHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const stores = [
    {
      name: 'Kondotty Store',
      url: 'https://share.google/KmX6a4DsYGlfS8PNo'
    },
    {
      name: 'Tirurangadi Store',
      url: 'https://share.google/bJKAVTVhJpiZr150q'
    }
  ]

  return (
    <div 
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsMenuOpen(false)
      }}
    >
      <div className="relative">
        {/* Main button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-3 sm:p-4 shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-red-500/50"
        >
          <svg 
            className="w-6 h-6 sm:w-8 sm:h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {(isHovered || isMenuOpen) && (
          <div className="absolute left-full ml-3 bottom-0 bg-white rounded-xl shadow-2xl border-2 border-red-500/30 overflow-hidden min-w-[200px] z-50">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2">
              <p className="text-white font-bold text-sm">Our Stores</p>
            </div>
            <div className="py-2">
              {stores.map((store, index) => (
                <a
                  key={index}
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-red-50 hover:text-red-600 transition-all duration-200 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{store.name}</span>
                  <svg className="w-3 h-3 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tooltip for mobile */}
        {isHovered && !isMenuOpen && (
          <div className="hidden sm:block absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shadow-xl">
            Find Our Stores
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-black"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatingLocation
