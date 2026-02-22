import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getWishlist, removeFromWishlist } from '../services/wishlistService'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'

function Wishlist() {
  const [wishlist, setWishlist] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist()
      setWishlist(data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="h-9 w-48 rounded bg-slate-200 animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-400 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg className="w-16 h-16 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black mb-4">Your Wishlist is Empty 💔</h2>
            <p className="text-xl text-gray-600 mb-8">Start saving your favorite toys and gadgets! 🎁</p>
            <Link to="/products" className="btn-primary text-lg px-8 py-4 inline-block transform hover:scale-110 active:scale-95">
              Start Shopping! 🚀
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-8">My Wishlist ❤️</h1>
        <p className="text-lg text-gray-600 mb-8">
          {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved for later
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {wishlist.items.map((item, index) => (
            <div key={item.product._id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ProductCard product={item.product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Wishlist
