import { useState, useEffect } from 'react'
import api from '../services/api'

export function useButtonColor() {
  const [buttonColor, setButtonColor] = useState('#2563eb') // Default blue
  const [loading, setLoading] = useState(true)

  const fetchButtonColor = async () => {
    try {
      const response = await api.get('/settings/button-color')
      if (response.data && response.data.color) {
        setButtonColor(response.data.color)
      }
    } catch (error) {
      console.error('Error fetching button color:', error)
      // Keep default color on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchButtonColor()
    
    // Listen for color change events from admin panel
    const handleColorChange = (event) => {
      if (event.detail && event.detail.color) {
        setButtonColor(event.detail.color)
      }
    }
    
    window.addEventListener('buttonColorChanged', handleColorChange)
    
    // Refresh color every 30 seconds to pick up admin changes
    const interval = setInterval(fetchButtonColor, 30000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('buttonColorChanged', handleColorChange)
    }
  }, [])

  return { buttonColor, loading }
}
