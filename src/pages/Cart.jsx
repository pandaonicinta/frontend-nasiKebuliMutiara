import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight, HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz';

const getImageUrl = (imagePath) => {
  if (!imagePath) return foto;  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE_URL}/storage/${imagePath}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartCount, 
    removeFromCart, 
    updateQuantity, 
    toggleSelectItem,
    selectAllItems,
    selectedItems,
    calculateTotal,
    calculateSelectedTotal,
    clearCart,
    isLoading: contextLoading 
  } = useContext(CartContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const shippingCost = 10000;

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  // Calculate if all items are selected
  const allSelected = cartItems.length > 0 && 
    cartItems.every(item => selectedItems.includes(item.cart_item_id || item.id));

  // Handler for selecting all items
  const handleSelectAll = () => {
    selectAllItems();
  };

  // Handler for selecting a single item
  const handleToggleSelect = (cart_item_id) => {
    toggleSelectItem(cart_item_id);
  };

  // Selected items count
  const getSelectedCount = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.cart_item_id || item.id))
      .reduce((total, item) => total + item.quantity, 0);
  };

  // Total quantity count
  const getTotalQuantity = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Calculate subtotal for selected items
  const subtotal = calculateSelectedTotal();
  const total = subtotal + (getSelectedCount() > 0 ? shippingCost : 0);

  // Handler for changing item quantity
  const handleQuantityChange = async (id, size, qty) => {
    if (qty < 1) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      await updateQuantity(id, size, qty);
    } catch (err) {
      console.error('Error updating cart item quantity:', err);
      setError('Failed to update item quantity. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for decreasing quantity with separate function
  const handleDecreaseQuantity = async (id, size, currentQty) => {
    if (currentQty <= 1) return;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // For decreasing, we'll use a direct API call if needed
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (token) {
        // If authenticated, make the API call directly - this might bypass issues in the context
        const cartItemId = cartItems.find(item => item.id === id && item.size === size)?.cart_item_id;
        if (cartItemId) {
          await axios.put(`${API_BASE_URL}/api/keranjang/${cartItemId}`, {
            quantity: currentQty - 1
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      // Update in context as well
      await updateQuantity(id, size, currentQty - 1);
    } catch (err) {
      console.error('Error decreasing cart item quantity:', err);
      setError('Failed to decrease item quantity. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for increasing quantity
  // Improved handleIncreaseQuantity that uses the POST method to /api/keranjang/add
const handleIncreaseQuantity = async (id, size, currentQty) => {
  setIsUpdating(true);
  setError(null);
  
  try {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      // Direct API call using POST to /api/keranjang/add
      await axios.post(`${API_BASE_URL}/api/keranjang/add`, {
        product_id: id,
        quantity: currentQty + 1,
        size: size || null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh the cart after direct API update
      // This might be better than using updateQuantity which is causing errors
      const cartResponse = await axios.get(`${API_BASE_URL}/api/keranjang`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (cartResponse.data && cartResponse.data.success) {
        // You could potentially dispatch an action or call a method to update the cart context
        // For now, we'll still call updateQuantity to maintain compatibility
        await updateQuantity(id, size, currentQty + 1);
      }
    } else {
      // For unauthenticated users, use the existing context method
      await updateQuantity(id, size, currentQty + 1);
    }
  } catch (err) {
    console.error('Error increasing cart item quantity:', err);
    setError('Failed to increase item quantity. Please try again.');
  } finally {
    setIsUpdating(false);
  }
};

  // Handler for removing an item
  const handleRemoveItem = async (id, size) => {
    setError(null);
    try {
      await removeFromCart(id, size);
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  // Handler for clearing all items
  const handleClearCart = async () => {
    if(!confirm('Are you sure you want to clear your cart?')) return;
    
    setError(null);
    try {
      await clearCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart. Please try again.');
    }
  };

  // Handler for checkout
  const handleCheckout = async () => {
    if (getSelectedCount() === 0) {
      alert('Please select at least one item to checkout');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get selected items for checkout
      const checkoutItems = cartItems
        .filter(item => selectedItems.includes(item.cart_item_id || item.id))
        .map(item => ({
          id: item.id,
          cart_item_id: item.cart_item_id || item.id,
          nama: item.name,
          harga: String(item.price), 
          quantity: item.quantity,
          size: item.size || '',
          image: item.image
        }));

      // Store checkout data in session storage
      sessionStorage.setItem('selectedCartItemIds', JSON.stringify(selectedItems));
      sessionStorage.setItem('checkoutItems', JSON.stringify(checkoutItems));
      sessionStorage.setItem('checkoutTotal', total.toString());
      sessionStorage.setItem('checkoutShipping', shippingCost.toString());
      
      navigate('/checkout');
    } catch (err) {
      console.error('Error during checkout process:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for account navigation
  const handleAccountNavigation = () => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (token) {
      if (!userRole || userRole === "undefined" || userRole === "unknown") {
        axios.get(`${API_BASE_URL}/api/aboutMe`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          const role = response.data.role || response.data.user?.role;
          
          if (role) {
            localStorage.setItem('userRole', role);
            if (role === 'admin') {
              navigate('/admin');
            } else if (role === 'pembeli') {
              navigate('/customer');
            } else {
              navigate('/login');
            }
          } else {
            navigate('/login');
          }
        })
        .catch(error => {
          console.error("Error fetching user info:", error);
          navigate('/login');
        });
      } else {
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'pembeli') {
          navigate('/customer');
        } else {
          navigate('/login');
        }
      }
    } else {
      navigate('/login');
    }
  };

  if (isLoading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FDC302]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="bg-white py-4 px-4 md:px-8 lg:px-12 shadow-sm">
        <div className="flex justify-between items-center">
          <img
            src={logo}
            alt="Nasi Kebuli Mutiara"
            className="h-12 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-800 hover:text-[#FDC302] font-medium">Home</a>
            <a href="/about" className="text-gray-800 hover:text-[#FDC302] font-medium">About Us</a>
            <a href="/menu" className="text-gray-800 hover:text-[#FDC302] font-medium">Menu</a>
            <a href="/cart" className="text-[#FDC302] relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-[#FDC302] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </a>
            {isAuthenticated ? (
              <button
                onClick={handleAccountNavigation}
                className="px-6 py-2 bg-gradient-to-r from-[#FDC302] to-yellow-300 text-white rounded-full hover:from-yellow-500 hover:to-yellow-400 shadow-md transition duration-300 flex items-center"
              >
                My Account <HiOutlineArrowNarrowRight className="ml-2" />
              </button>
            ) : (
              <a
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-[#FDC302] to-yellow-300 text-white rounded-full hover:from-yellow-500 hover:to-yellow-400 shadow-md transition duration-300 flex items-center"
              >
                Login <HiOutlineArrowNarrowRight className="ml-2" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600">({cartCount} {cartCount === 1 ? 'Item' : 'Items'})</p>
        </div>

        {/* Authentication status indication */}
        {!isAuthenticated && cartCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-700 text-sm">
              <span className="font-bold">Note:</span> You are not logged in. Your cart items are saved locally.
              <a href="/login" className="ml-1 text-amber-700 underline">Login</a> to save your cart items to your account.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <span className="font-bold">Error:</span> {error}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FiShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-6">Your cart is empty</p>
                <button
                  onClick={() => navigate('/menu')}
                  className="bg-[#FDC302] text-white py-3 px-6 rounded-md hover:bg-yellow-500 transition duration-300 flex items-center mx-auto"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-md">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#FDC302] focus:ring-[#FDC302] rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Select All Items ({cartCount})
                  </label>
                  <span className="ml-auto text-sm text-gray-500">
                    {getSelectedCount()} of {getTotalQuantity()} selected
                  </span>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-2 mb-4 pb-2 border-b">
                  <div className="col-span-1"></div>
                  <div className="col-span-4 font-semibold">Product Details</div>
                  <div className="col-span-2 font-semibold">Price</div>
                  <div className="col-span-2 font-semibold">Quantity</div>
                  <div className="col-span-3 font-semibold">Total</div>
                </div>

                {/* Items List */}
                <div className="max-h-[450px] overflow-y-auto pr-2">
                  {cartItems.map(item => {
                    const itemId = item.cart_item_id || item.id;
                    const isSelected = selectedItems.includes(itemId);
                    const itemTotal = item.price * item.quantity;
                    
                    return (
                      <div key={`${item.id}-${item.size || ''}`} className="grid md:grid-cols-12 gap-2 py-4 border-b items-center">
                        <div className="col-span-1 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(itemId)}
                            className="w-4 h-4 text-[#FDC302] focus:ring-[#FDC302] rounded border-gray-300"
                          />
                        </div>
                        <div className="col-span-4 flex gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => { e.target.onerror = null; e.target.src = foto; }}
                          />
                          <div className="pr-2">
                            <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                            {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                          </div>
                        </div>
                        <div className="col-span-2 text-gray-700 text-sm">{formatPrice(item.price)}</div>
                        <div className="col-span-2">
                          <div className="flex items-center border border-gray-300 rounded-md w-24">
                            <button
                              onClick={() => handleDecreaseQuantity(item.id, item.size, item.quantity)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                              disabled={isUpdating || item.quantity <= 1}
                            >
                              –
                            </button>
                            <span className="px-2 py-1 flex-1 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleIncreaseQuantity(item.id, item.size, item.quantity)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              aria-label="Increase quantity"
                              disabled={isUpdating}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-between">
                          <span className="font-medium text-sm">{formatPrice(itemTotal)}</span>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.size)}
                            className="text-red-500 hover:text-red-700 bg-gray-100 p-2 rounded-full"
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => navigate('/menu')}
                    className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition duration-300"
                  >
                    <HiOutlineArrowNarrowLeft className="mr-2" /> Continue Shopping
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex items-center bg-red-100 text-red-600 py-2 px-4 rounded-md hover:bg-red-200 transition duration-300"
                  >
                    <FiTrash2 className="mr-2" /> Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold mb-4 text-center">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-2 text-sm">Selected Products:</h3>
                  {cartItems.map(item => {
                    const itemId = item.cart_item_id || item.id;
                    if (!selectedItems.includes(itemId)) return null;
                    
                    return (
                      <div key={`summary-${item.id}-${item.size || ''}`} className="flex justify-between text-gray-700 mb-1 text-xs">
                        <span className="truncate max-w-[150px]">
                          {item.name} {item.size ? `(${item.size})` : ''} ×{item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    );
                  })}
                  {getSelectedCount() === 0 && (
                    <div className="text-gray-500 text-xs italic">No items selected</div>
                  )}
                </div>

                <div className="flex justify-between py-1 text-sm">
                  <span>Sub Total</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b pb-3 text-sm">
                  <span>Shipping</span>
                  <span className="font-medium">{getSelectedCount() > 0 ? formatPrice(shippingCost) : 'Rp. 0'}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Total</span>
                  <span className="text-red-700">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={getSelectedCount() === 0}
                className={`w-full py-3 px-4 bg-[#FDC302] text-white rounded-md flex items-center justify-center transition duration-300 ${
                  getSelectedCount() === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
                }`}
              >
                Checkout Selected Items ({getSelectedCount()}) <HiOutlineArrowNarrowRight className="ml-2" />
              </button>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Safe and Secure Payments. Easy Returns.
                </div>
                <p>100% Authentic Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>


   
      
        <footer className="bg-red-900 text-white py-8 px-6 md:px-20 lg:px-32">
                        <div className="container mx-auto">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                              <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
                            </div>
                            <div className="lg:col-span-1">
                              <h3 className="text-base font-semibold mb-4">Navigation</h3>
                              <div className="grid grid-cols-2 gap-x-4">
                                <ul className="space-y-2">
                                  <li>
                                    <a href="/" className="hover:text-yellow-400 flex items-center text-xs">
                                      <span className="text-yellow-400 mr-2">•</span>
                                      Home
                                    </a>
                                  </li>
                                  <li>
                                    <a href="/about" className="hover:text-yellow-400 flex items-center text-xs">
                                      <span className="text-yellow-400 mr-2">•</span>
                                      About
                                    </a>
                                  </li>
                                  </ul>
                                <ul className="space-y-2">
                                  <li>
                                    <a href="/menu" className="hover:text-yellow-400 flex items-center text-xs">
                                      <span className="text-yellow-400 mr-2">•</span>
                                      Menu
                                    </a>
                                  </li>
                                  <li>
                                    <a href="/cart" className="hover:text-yellow-400 flex items-center text-xs">
                                      <span className="text-yellow-400 mr-2">•</span>
                                      Keranjang
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                
                            {/* Contact Information Section  */}
                              <div className="lg:col-span-2">
                                <div className="flex flex-col md:flex-row md:justify-between">
                                  <div className="flex-1">
                                    {/* Address */}
                                    <div className="flex items-start mb-3">
                                      <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-xs">Alamat:</h4>
                                        <p className="text-xs max-w-xs">
                                          Jl. Villa Mutiara Cikarang blok H10, No.37, Ciantra, Cikarang Sel. Kab. Bekasi, Jawa Barat 17530
                                        </p>
                                      </div>
                                    </div>
                
                                    {/* Email */}
                                    <div className="flex items-start mb-3">
                                      <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                        </svg>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-xs">Email:</h4>
                                        <p className="text-xs">
                                          <a href="mailto:mutiara@gmail.com" className="hover:text-red-800 transition-colors">
                                            mutiara@gmail.com
                                          </a>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                
                                  {/* Social Media x  */}
                                  <div className="mt-4 md:mt-0 flex items-start md:justify-end">
                                    <div className="flex space-x-3">
                                      <a href="https://facebook.com/mutiaravillage" 
                                        className="bg-red-800 p-1.5 rounded-md hover:bg-red-700 transition-colors"
                                        aria-label="Facebook"
                                        target="_blank" 
                                        rel="noopener noreferrer">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 2v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v7h-3v-7h-2v-3h2V7.5C13 5.57 14.57 4 16.5 4H19z"/>
                                        </svg>
                                      </a>
                                      <a href="https://instagram.com/mutiaravillage" 
                                        className="bg-red-800 p-1.5 rounded-md hover:bg-red-700 transition-colors" 
                                        aria-label="Instagram"
                                        target="_blank" 
                                        rel="noopener noreferrer">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                                        </svg>
                                      </a>
                                      <a href="https://wa.me/6289797929390" 
                                        className="bg-red-800 p-1.5 rounded-md hover:bg-red-700 transition-colors" 
                                        aria-label="WhatsApp"
                                        target="_blank" 
                                        rel="noopener noreferrer">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.94A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </footer>
                
                        {/* Copyright Section */}
                        <div className="bg-red-900 text-white text-center py-3 px-6 md:px-20 lg:px-32">
                          <div className="w-full h-px bg-red-800 mb-4"></div> 
                          <div className="p-0 mt-0"></div>
                          <div className="container mx-auto">
                            <p className="text-xs">Copyright © 2025 Kebuli Mutiara. All rights reserved.</p>
                          </div>
                        </div>
                      </div>
                    );
                  };

  export default Cart;
