import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';
import axios from 'axios';
import defaultImage from '../assets/images/foto.png'; // Default image for products

const API_BASE_URL = 'http://kebabmutiara.xyz';

const CustomerOrder = () => {
  const navigate = useNavigate();
  const customerName = localStorage.getItem('userName') || 'Customer';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    console.log("Current user role in CustomerOrder:", userRole);
    
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      console.log("Invalid role detected, redirecting to home");
      navigate('/');
    }
  }, [navigate]);

  // Check if we have cart items and create a temporary order if there are no orders
  useEffect(() => {
    const checkCartAndCreateTempOrder = async () => {
      try {
        const cartItems = localStorage.getItem('cartItems');
        if (cartItems && orders.length === 0 && !loading) {
          const parsedItems = JSON.parse(cartItems);
          if (parsedItems && parsedItems.length > 0) {
            console.log("Creating temporary order from cart items", parsedItems);
            
            // Create a temporary order from cart items
            const tempOrder = {
              transaksi_id: 'temp-' + Date.now(),
              id: 'temp-' + Date.now(),
              keranjang: parsedItems,
              status: 'pending',
              total: parsedItems.reduce((sum, item) => sum + (item.harga * item.quantity), 0),
              created_at: new Date().toISOString()
            };
            
            // Set this as an order to display
            setOrders([tempOrder]);
          }
        }
      } catch (err) {
        console.error("Error processing cart items:", err);
      }
    };
    
    if (!loading && orders.length === 0) {
      checkCartAndCreateTempOrder();
    }
  }, [orders.length, loading]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/transaksi`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log("Orders data received:", response.data);
        
        // Handle different response structures
        let ordersData = [];
        if (response.data && response.data.data) {
          ordersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data && response.data.transaksi) {
          ordersData = response.data.transaksi;
        }
        
        if (ordersData && ordersData.length > 0) {
          setOrders(ordersData);
        } else {
          // Try fetching from cart API as fallback
          const cartResponse = await axios.get(`${API_BASE_URL}/api/keranjang`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log("Cart data received:", cartResponse.data);
          
          // Check if we got cart data
          if (cartResponse.data && 
              (cartResponse.data.data || 
               (Array.isArray(cartResponse.data) && cartResponse.data.length > 0))) {
            
            const cartItems = cartResponse.data.data || cartResponse.data;
            
            if (cartItems.length > 0) {
              // Create a temporary order from cart items
              const tempOrder = {
                transaksi_id: 'temp-' + Date.now(),
                id: 'temp-' + Date.now(),
                keranjang: cartItems,
                status: 'pending',
                total: cartItems.reduce((sum, item) => sum + (item.harga * item.quantity), 0),
                created_at: new Date().toISOString()
              };
              
              setOrders([tempOrder]);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to load order history. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_BASE_URL}/storage/${imagePath}`;
  };

  // Function to format status label based on TransaksiController status values
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Payment Pending',
      'success': 'Payment Completed',
      'failed': 'Payment Failed',
      'on process': 'Cooking',
      'on deliver': 'On The Way',
      'delivered': 'Delivered',
      'completed': 'Completed',
    };
    
    return statusMap[status] || status;
  };

  // Function to format date from API response
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString || new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/customer/order/${orderId}`);
  };

  // Helper function to extract items from order
  const getOrderItems = (order) => {
    if (!order) return [];
    
    // Based on your data format in the console log
    if (order.keranjang && Array.isArray(order.keranjang)) {
      return order.keranjang.map(item => ({
        nama: item.nama_produk || item.produk?.nama || 'Unknown Product',
        ukuran: item.ukuran || '-',
        jumlah: item.quantity || 1,
        harga: item.harga || 0,
        gambar: item.gambar || null
      }));
    }
    
    // Fallback for different data structure
    if (order.items && Array.isArray(order.items)) {
      return order.items.map(item => ({
        nama: item.nama_produk || item.name || 'Unknown Product',
        ukuran: item.ukuran || '-',
        jumlah: item.quantity || 1,
        harga: item.harga || item.price || 0,
        gambar: item.gambar || item.image || null
      }));
    }

    // Last fallback - if order itself is an item
    if (order.nama_produk || order.name) {
      return [{
        nama: order.nama_produk || order.name || 'Unknown Product',
        ukuran: order.ukuran || '-',
        jumlah: order.quantity || 1,
        harga: order.harga || order.price || 0,
        gambar: order.gambar || order.image || null
      }];
    }
    
    return [];
  };

  // Helper function to get order ID
  const getOrderId = (order) => {
    return order.transaksi_id || order.id || '';
  };

  // If no data is loaded after a while, try to use cart data
  useEffect(() => {
    if (!loading && orders.length === 0 && !error) {
      console.log("No orders found. Checking cart items...");
      
      // Try to get cart items from localStorage
      const cartItems = localStorage.getItem('cartItems');
      if (cartItems) {
        try {
          const parsedItems = JSON.parse(cartItems);
          if (parsedItems && parsedItems.length > 0) {
            console.log("Creating order from localStorage cart items");
            
            // Create a temporary order object
            const tempOrder = {
              transaksi_id: 'temp-' + Date.now(),
              id: 'temp-' + Date.now(),
              keranjang: parsedItems,
              status: 'pending',
              total: parsedItems.reduce((sum, item) => sum + (item.harga * item.quantity), 0),
              created_at: new Date().toISOString()
            };
            
            setOrders([tempOrder]);
          }
        } catch (err) {
          console.error("Error parsing cart items:", err);
        }
      }
    }
  }, [loading, orders, error]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Background with red top 1/3 and accent pattern */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
      </div>

      {/* Sidebar */}
      <CustomerSidebar activePage="order" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        {/* Header with Page Title and Customer badge */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">My Order</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Order Heading */}
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">My Order</h2>
          </div>

          {/* Red divider line - thinner */}
          <div className="h-0.5 bg-red-800"></div>

          {/* Order List Table Header */}
          <div className="flex bg-red-800 text-white p-3 text-sm">
            <div className="w-16 text-center">NO</div>
            <div className="flex-1">ORDER</div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
              <p className="mt-2 text-gray-600">Loading your orders...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-800 text-white px-4 py-2 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No orders state */}
          {!loading && !error && orders.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-600">You don't have any orders yet.</p>
              <button 
                onClick={() => navigate('/menu')}
                className="mt-4 bg-red-800 text-white px-4 py-2 rounded text-sm"
              >
                Browse Menu
              </button>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && orders.map((order, index) => (
            <div key={getOrderId(order) || index} className="border-b border-gray-200 last:border-b-0">
              <div className="flex p-3">
                <div className="w-16 text-center">{index + 1}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start border-2 border-red-800 rounded-lg p-3 mb-4">
                    <div className="w-full flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="bg-red-800 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-bold">{formatStatus(order.status || 'pending')}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {order.status === 'delivered' ? 'Enjoy your meal' : 'Thank you for your order'}
                        </span>
                      </div>
                      <span className="text-xs">{formatDate(order.created_at)}</span>
                    </div>
                    
                    {/* Divider between status and order items */}
                    <div className="w-full h-px bg-gray-300 my-3"></div>

                    {/* Order Items */}
                    {getOrderItems(order).map((item, itemIndex) => (
                      <div key={itemIndex} className="w-full flex items-center mt-2">
                        <div className="w-10 mr-3">
                          {/* Empty column for alignment */}
                        </div>
                        <div className="w-12 h-12 mr-3">
                          <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={getImageUrl(item.gambar)}
                              alt={item.nama}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = defaultImage;
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold">{item.nama}</h4>
                          <p className="text-xs text-gray-500">Size: {item.ukuran || '-'}</p>
                        </div>
                        <div className="flex flex-1 justify-evenly">
                          <div className="text-center text-xs">
                            {item.jumlah || 1}
                          </div>
                          <div className="text-center text-xs font-bold">
                            Rp. {(typeof item.harga === 'number' 
                              ? item.harga.toLocaleString('id-ID') 
                              : '0')}
                          </div>
                        </div>
                        <div className="w-28 text-right">
                          <button
                            onClick={() => handleViewDetails(getOrderId(order))}
                            className="text-xs text-white bg-red-800 px-3 py-1 rounded mt-1 inline-block"
                          >
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* If there are no items in the order */}
                    {getOrderItems(order).length === 0 && (
                      <div className="w-full text-center py-2">
                        <p className="text-sm text-gray-500">No items in this order</p>
                      </div>
                    )}
                    
                    {/* Total amount */}
                    <div className="w-full flex justify-end mt-4 pt-2 border-t border-gray-200">
                      <div className="text-sm font-bold">
                        Total: Rp. {(typeof order.total === 'number' 
                          ? order.total.toLocaleString('id-ID') 
                          : '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder;