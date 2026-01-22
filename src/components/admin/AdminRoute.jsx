import { Navigate } from 'react-router-dom'
import api from '../../services/api'
import { useEffect, useState } from 'react'

function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      const adminAuth = localStorage.getItem('adminAuth')
      
      if (!token || adminAuth !== 'true') {
        setIsAuthenticated(false)
        setIsChecking(false)
        return
      }

      // Verify token is still valid by making a test request
      try {
        // Set token in headers for this check
        const originalToken = api.defaults.headers.common['Authorization']
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Try to access a protected admin endpoint
        await api.get('/admin/dashboard/stats')
        setIsAuthenticated(true)
        
        // Restore original token
        api.defaults.headers.common['Authorization'] = originalToken
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminAuth')
        localStorage.removeItem('admin')
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminRoute
