import { Navigate } from 'react-router-dom'

function AdminRedirect() {
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true'
  return <Navigate to={isAuthenticated ? '/admin/dashboard' : '/admin/login'} replace />
}

export default AdminRedirect
