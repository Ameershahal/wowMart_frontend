import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordService } from '../services/userService'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      await forgotPasswordService(email.toLowerCase().trim())
      setSuccess(true)
      setEmail('')
    } catch (err) {
      // Even if API fails, show success message for security (don't reveal if email exists)
      // In production, you might want to handle this differently
      const errorMessage = err.response?.data?.message || err.message
      
      // If it's a 404 or user not found, still show success for security
      if (err.response?.status === 404 || errorMessage?.toLowerCase().includes('not found')) {
        setSuccess(true)
        setEmail('')
      } else {
        // For other errors, show the error
        setError(errorMessage || 'Unable to send reset link. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-black mb-2">
            Forgot Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your email to reset your password
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">Password reset link has been sent to your email!</p>
              </div>
              <Link
                to="/login"
                className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold text-sm border border-black hover:bg-yellow-500 transition-all"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-black font-semibold mb-1.5 text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  required
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm transition-all"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black px-4 py-2.5 rounded-lg font-semibold text-sm border border-black hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
