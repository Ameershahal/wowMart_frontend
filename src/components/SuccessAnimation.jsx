import { useEffect, useState } from 'react'

const TOAST_DURATION_MS = 1200

function SuccessAnimation({ show, message = 'Added to Cart!' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!show) {
      setIsVisible(false)
      return
    }
    setIsVisible(true)
    const timer = setTimeout(() => setIsVisible(false), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [show])

  if (!show || !isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-green-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm sm:text-base">
        <div className="relative">
          <svg 
            className="w-6 h-6 sm:w-8 sm:h-8 animate-scale-in" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ animation: 'checkmark 0.5s ease-out' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <span>{message}</span>
      </div>
    </div>
  )
}

export default SuccessAnimation
