import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2Callback from './pages/OAuth2Callback';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminEmails from './pages/admin/AdminEmails';
import { useAuth } from './context/AuthContext';

function AdminRedirectHandler({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  
  if (!loading && isAuthenticated && user?.role === 'ADMIN' && !isAdminPath) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <AdminRedirectHandler>
          <div className="flex flex-col min-h-screen theme-bg-page">
            {!isAdminPath && <Navbar />}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                <Route path="/cart" element={
                  <ProtectedRoute><Cart /></ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute><Checkout /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><Orders /></ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute><Wishlist /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="inventory" element={<AdminInventory />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="emails" element={<AdminEmails />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                } />
              </Routes>
            </main>
            {!isAdminPath && <Footer />}
          </div>
        </AdminRedirectHandler>
        <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#f3f4f6',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: { primary: '#D4A574', secondary: '#0a0a0a' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
    );
}

export default App;
