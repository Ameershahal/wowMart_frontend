import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null)
  const [isVisible, setIsVisible] = useState(true)

  // Initialize CSS variable immediately on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--announcement-height', '0px')
  }, [])

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.get('/announcement')
        if (response.data) {
          setAnnouncement(response.data)
        }
      } catch (error) {
        console.error('Error fetching announcement:', error)
      }
    }
    
    fetchAnnouncement()
    
    // Refresh announcement every 5 minutes
    const interval = setInterval(fetchAnnouncement, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Set CSS variable for navbar positioning
    if (announcement && announcement.isActive && isVisible) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const bannerElement = document.querySelector('.announcement-banner');
          if (bannerElement) {
            const height = Math.max(bannerElement.offsetHeight, bannerElement.scrollHeight) || 18;
            document.documentElement.style.setProperty('--announcement-height', `${height}px`);
          }
        });
      });
    } else {
      // Reset to 0 when no announcement or not visible
      document.documentElement.style.setProperty('--announcement-height', '0px');
    }
  }, [announcement, isVisible]);

  if (!announcement || !announcement.isActive || !isVisible) {
    return null
  }

  return (
    <div 
      className="announcement-banner w-full py-0.5 px-2 text-center text-[10px] font-semibold z-50 fixed top-0 left-0 right-0"
      style={{
        backgroundColor: announcement.backgroundColor || '#fbbf24',
        color: announcement.textColor || '#000000',
        lineHeight: '1.1',
        height: 'auto',
        minHeight: 'auto'
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-1.5" style={{ minHeight: 'auto', height: 'auto' }}>
        <span className="flex-1 truncate" style={{ lineHeight: '1' }}>{announcement.message}</span>
        {announcement.linkUrl && announcement.linkText && (
          <Link
            to={announcement.linkUrl}
            className="underline hover:opacity-80 transition-opacity font-bold whitespace-nowrap text-[10px]"
            style={{ 
              color: announcement.textColor || '#000000',
              minHeight: 'auto',
              minWidth: 'auto',
              height: 'auto',
              lineHeight: '1',
              padding: 0
            }}
          >
            {announcement.linkText}
          </Link>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="ml-0 hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close announcement"
          style={{ 
            color: announcement.textColor || '#000000',
            minHeight: 'auto',
            minWidth: 'auto',
            height: 'auto',
            width: 'auto',
            padding: '2px'
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AnnouncementBanner

