import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../utils/logout'
import { getAddressService } from '../services/userService'

function Profile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  // Load user info and saved address on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userJson = localStorage.getItem('user')
        if (userJson) {
          const user = JSON.parse(userJson)
          setFormData(prev => ({
            ...prev,
            name: user.name || user.fullName || '',
            email: user.email || '',
            phone: user.phone || ''
          }))
        }
        // Load saved address (from checkout) if logged in
        try {
          const res = await getAddressService()
          if (res.data?.savedAddress) {
            const a = res.data.savedAddress
            const addressLine = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(', ')
            setFormData(prev => ({ ...prev, address: addressLine || prev.address }))
          }
        } catch {
          // Fallback: use localStorage saved address (same key as checkout)
          const saved = localStorage.getItem('savedShippingAddress')
          if (saved) {
            const a = JSON.parse(saved)
            const addressLine = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(', ')
            setFormData(prev => ({ ...prev, address: addressLine || prev.address }))
          }
        }
      } catch (e) {
        console.error('Error loading profile', e)
      }
    }
    loadProfile()
  }, [])

  const handleLogout = () => {
    logout();
    navigate("/"); // navigate after removing token
  };


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement actual profile update API call
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white py-6 sm:py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-black mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your account information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <nav className="space-y-2">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-lg bg-yellow-400 text-black font-semibold text-sm"
                >
                  Profile
                </Link>
                <Link
                  to="/my-orders"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-sm transition-colors"
                >
                  My Orders
                </Link>
                <button
                   className="block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold text-sm transition-colors"
                   onClick={handleLogout}
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-black font-semibold mb-1.5 text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-black font-semibold mb-1.5 text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-black font-semibold mb-1.5 text-sm">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-black font-semibold mb-1.5 text-sm">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter your address"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm transition-all resize-none"
                  />
                </div>

                {success && (
                  <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg text-sm">
                    Profile updated successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-semibold text-sm border border-black hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
