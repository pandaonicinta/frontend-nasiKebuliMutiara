import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import About from './pages/AboutUs';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import ThankYou from './pages/ThankYou'; 

// Admin Components
import AdminDashboard from './pages/AdminDashboard';
import AdminOrder from './pages/AdminOrder';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminReview from './pages/AdminReview';
import AdminCustomer from './pages/AdminCustomer';
import AdminProfile from './pages/AdminProfile';
import AdminMenu from './pages/AdminMenu';
import AddMenu from './pages/AddMenu';

// Customer Components
import CustomerOrder from './pages/CustomerOrder';
import CustomerOrderDetail from './pages/CustomerOrderDetail';
import CustomerReview from './pages/CustomerReview';
import CustomerReviewDetail from './pages/CustomerReviewDetail';
import CustomerAddress from './pages/CustomerAddress';  
import CustomerProfile from './pages/CustomerProfile';  

const ProtectedRoute = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (!userRole) {
    // User not logged in, redirect to signin
    return <Navigate to="/signin" replace />;
  }
  
  // Handle pembeli role as equivalent to customer
  const normalizedRole = userRole === 'pembeli' ? 'customer' : userRole;
  
  if (allowedRole && normalizedRole !== allowedRole) {
    // User logged in but doesn't have the required role
    return <Navigate to={normalizedRole === 'admin' ? '/admin' : '/'} replace />;
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check authentication status when the component mounts
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      
      // Store the token if it exists in the URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('authToken', token);
        // Clean up URL after extracting token
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<SignIn />} />

          {/* Routes that require authentication */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          {/* Thank You page bisa tanpa proteksi supaya bisa diakses setelah pembayaran */}
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRole="admin">
              <AdminOrder />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders/:id" element={
            <ProtectedRoute allowedRole="admin">
              <AdminOrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/review" element={
            <ProtectedRoute allowedRole="admin">
              <AdminReview />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute allowedRole="admin">
              <AdminCustomer />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute allowedRole="admin">
              <AdminMenu />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu/add" element={
            <ProtectedRoute allowedRole="admin">
              <AddMenu />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu/edit/:id" element={
            <ProtectedRoute allowedRole="admin">
              <AddMenu />
            </ProtectedRoute>
          } />

          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerOrder />
            </ProtectedRoute>
          } />
          <Route path="/customer/order/:id" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerOrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/customer/review" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerReview />
            </ProtectedRoute>
          } />
          <Route path="/customer/review/:orderId" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerReviewDetail />
            </ProtectedRoute>
          } />
          <Route path="/customer/address" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerAddress />
            </ProtectedRoute>
          } />
          <Route path="/customer/address/:addressId" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerAddress />
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRole="customer">
              <CustomerProfile />
            </ProtectedRoute>
          } />

          {/* Catch all for 404 pages */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
