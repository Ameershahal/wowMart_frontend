import { useState, useEffect } from 'react'
import api from '../services/api'

let cachedButtonColor = null
let buttonColorPromise = null

const loadButtonColor = async () => {
  if (cachedButtonColor) {
    return cachedButtonColor
  }

  if (!buttonColorPromise) {
    buttonColorPromise = api.get('/settings/button-color')
      .then((response) => {
        const fetchedColor = response?.data?.color
        if (fetchedColor) {
          cachedButtonColor = fetchedColor
        }
        return cachedButtonColor
      })
      .catch((error) => {
        console.error('Error fetching button color:', error)
        return cachedButtonColor
      })
      .finally(() => {
        buttonColorPromise = null
      })
  }

  return buttonColorPromise
}

export function useButtonColor() {
  const [buttonColor, setButtonColor] = useState('#EBC12B') // Default brand yellow (no blue flash before API loads)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    loadButtonColor().then((resolvedColor) => {
      if (!mounted) return
      if (resolvedColor) setButtonColor(resolvedColor)
      setLoading(false)
    })
    
    // Listen for color change events from admin panel
    const handleColorChange = (event) => {
      if (event.detail && event.detail.color) {
        cachedButtonColor = event.detail.color
        setButtonColor(event.detail.color)
      }
    }
    
    window.addEventListener('buttonColorChanged', handleColorChange)

    return () => {
      mounted = false
      window.removeEventListener('buttonColorChanged', handleColorChange)
    }
  }, [])

  return { buttonColor, loading }
}
