import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import FloatingLocation from './components/FloatingLocation'
import AdminLayout from './components/admin/AdminLayout'
import AdminRoute from './components/admin/AdminRoute'
import AdminRedirect from './components/admin/AdminRedirect'
import Footer from './components/Footer'
import ProtectedRoute from './utils/ProtectedRoute'
import UnprotectedRoute from './utils/UnprotectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Categories = lazy(() => import('./pages/Categories'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const OrderStatus = lazy(() => import('./pages/OrderStatus'))
const Profile = lazy(() => import('./pages/Profile'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const Policy = lazy(() => import('./pages/Policy'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))

function PageFallback() {
  return <div className="min-h-[40vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /></div>
}

// User-facing layout wrapper
function UserLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-surface-subtle overflow-hidden">
      <div className="pointer-events-none fixed top-1/2 left-0 -translate-y-1/2 -translate-x-1/3 w-[480px] h-[480px] rounded-full bg-blob-green z-0" aria-hidden="true" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingWhatsApp />
        <FloatingLocation />
      </div>
    </div>
  );
}



function App() {
  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<UserLayout><Home /></UserLayout>} />
          <Route path="/categories" element={<UserLayout><Categories /></UserLayout>} />
          <Route path="/products" element={<UserLayout><Products /></UserLayout>} />
          <Route path="/products/:id" element={<UserLayout><ProductDetail /></UserLayout>} />
          <Route path="/blog" element={<UserLayout><Blog /></UserLayout>} />
          <Route path="/blog/:slug" element={<UserLayout><BlogDetail /></UserLayout>} />
          <Route path="/policy" element={<UserLayout><Policy /></UserLayout>} />
          <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
          <Route path="/wishlist" element={<UserLayout><Wishlist /></UserLayout>} />
          <Route path="/order-success/:orderNumber" element={<UserLayout><OrderSuccess /></UserLayout>} />
          <Route path="/forgot-password" element={<UserLayout><ForgotPassword /></UserLayout>} />
          <Route path="/profile" element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><UserLayout><Checkout /></UserLayout></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><UserLayout><MyOrders /></UserLayout></ProtectedRoute>} />
          <Route path="/my-orders/:orderNumber" element={<ProtectedRoute><UserLayout><OrderStatus /></UserLayout></ProtectedRoute>} />
          <Route path="/login" element={<UnprotectedRoute><UserLayout><Login /></UserLayout></UnprotectedRoute>} />
          <Route path="/signup" element={<UnprotectedRoute><UserLayout><Signup /></UserLayout></UnprotectedRoute>} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
          <Route path="/admin/orders/:id" element={<AdminRoute><AdminLayout><AdminOrderDetail /></AdminLayout></AdminRoute>} />
          <Route path="/admin/banners" element={<AdminRoute><AdminLayout><AdminBanners /></AdminLayout></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
          <Route path="/admin/blogs" element={<AdminRoute><AdminLayout><AdminBlogs /></AdminLayout></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
