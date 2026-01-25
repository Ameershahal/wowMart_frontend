import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import FloatingLocation from './components/FloatingLocation'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Wishlist from './pages/Wishlist'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import MyOrders from './pages/MyOrders'
import Profile from './pages/Profile'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Policy from './pages/Policy'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminBanners from './pages/admin/AdminBanners'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBlogs from './pages/admin/AdminBlogs'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import AdminLayout from './components/admin/AdminLayout'
import AdminRoute from './components/admin/AdminRoute'
import AdminRedirect from './components/admin/AdminRedirect'
import Footer from './components/Footer'
import ProtectedRoute from './utils/ProtectedRoute'
import UnprotectedRoute from './utils/UnprotectedRoute'

// User-facing layout wrapper
function UserLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      
      {/* Fixed LEFT-CENTER Gradient Blob */}
      <div
        className="
          pointer-events-none
          fixed
          top-1/2
          left-0
          -translate-y-1/2
          -translate-x-1/3
          w-[500px]
          h-[500px]
          rounded-full
          bg-blob-green
          z-0
        "
      />

      {/* Page Content */}
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
      <Routes>
        {/* User-facing routes with Navbar and Footer */}
        <Route path="/" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/products" element={<UserLayout><Products /></UserLayout>} />
        <Route path="/products/:id" element={<UserLayout><ProductDetail /></UserLayout>} />
        <Route path="/blog" element={<UserLayout><Blog /></UserLayout>} />
        <Route path="/blog/:slug" element={<UserLayout><BlogDetail /></UserLayout>} />
        <Route path="/policy" element={<UserLayout><Policy /></UserLayout>} />
        <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
        <Route path="/wishlist" element={<UserLayout><Wishlist /></UserLayout>} />
        <Route path="/order-success/:orderNumber" element={<UserLayout><OrderSuccess /></UserLayout>} />
        <Route path="/forgot-password" element={<UserLayout><ForgotPassword /></UserLayout>} />

        <Route path="/profile" element={
  <ProtectedRoute>
    <UserLayout>
      <Profile />
    </UserLayout>
  </ProtectedRoute>
} />


<Route path="/checkout" element={
    <ProtectedRoute>
      <UserLayout>
        <Checkout />
    </UserLayout>
</ProtectedRoute>
} />



<Route path="/my-orders" element={
  <ProtectedRoute>
    <UserLayout>
      <MyOrders />
    </UserLayout>
  </ProtectedRoute>
} />

{/* Unprotected routes */}
<Route path="/login" element={
  <UnprotectedRoute>
    <UserLayout>
      <Login />
    </UserLayout>
  </UnprotectedRoute>
} />

<Route path="/signup" element={
  <UnprotectedRoute>
    <UserLayout>
      <Signup />
    </UserLayout>
  </UnprotectedRoute>
} />
        
        {/* Admin routes - completely separate, NO Navbar/Footer/FloatingWhatsApp */}
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOrderDetail />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBanners />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/blogs"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminBlogs />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
