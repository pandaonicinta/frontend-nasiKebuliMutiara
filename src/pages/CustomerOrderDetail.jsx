import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaHome, FaUser } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import aksen from '../assets/images/aksen.png';
import CustomerSidebar from './CustomerSidebar';
import defaultImage from '../assets/images/foto.png'; // Default image for products

const API_BASE_URL = 'http://kebabmutiara.xyz';

const CustomerOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the order ID from URL parameters
  const customerName = localStorage.getItem('userName') || 'Customer';
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    console.log("Current user role in CustomerOrderDetail:", userRole);
    
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      console.log("Invalid role detected, redirecting to home");
      navigate('/');
    }
  }, [navigate]);

  // Fetch order data when component mounts or id changes
 // Improved fetchOrders function with better debugging and data handling
const fetchOrders = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // Add detailed logging for API calls
    console.log("Fetching orders from API...");
    
    const response = await axios.get(`${API_BASE_URL}/api/transaksi`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Raw orders API response:", response);
    
    // Handle different response structures with deeper inspection
    let ordersData = [];
    
    if (response.data) {
      console.log("Response data structure:", Object.keys(response.data));
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log("Using response.data.data array");
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log("Using response.data array");
        ordersData = response.data;
      } else if (response.data.transaksi && Array.isArray(response.data.transaksi)) {
        console.log("Using response.data.transaksi array");
        ordersData = response.data.transaksi;
      } else if (typeof response.data === 'object') {
        // If response.data is a single order object, wrap it in an array
        console.log("Single order object detected, wrapping in array");
        ordersData = [response.data];
      }
    }
    
    console.log("Processed orders data:", ordersData);
    
    // Enhance each order with more robust product data extraction
    if (ordersData && ordersData.length > 0) {
      // Look deeper into each order to ensure product data is correctly extracted
      const enhancedOrders = ordersData.map(order => {
        console.log("Processing order:", order);
        
        // If this order has no keranjang/items but has products data
        if ((!order.keranjang || !Array.isArray(order.keranjang) || order.keranjang.length === 0) && 
            order.produk) {
          console.log("Order has produk data but no keranjang, creating keranjang from produk");
          
          // Create keranjang from produk data
          order.keranjang = Array.isArray(order.produk) ? 
            order.produk.map(p => ({
              nama_produk: p.nama || p.name,
              ukuran: p.ukuran || p.size || '-',
              quantity: p.quantity || p.jumlah || 1,
              harga: p.harga || p.price || 0,
              gambar: p.gambar || p.image
            })) : 
            [{
              nama_produk: order.produk.nama || order.produk.name,
              ukuran: order.produk.ukuran || order.produk.size || '-',
              quantity: order.produk.quantity || order.produk.jumlah || 1,
              harga: order.produk.harga || order.produk.price || 0,
              gambar: order.produk.gambar || order.produk.image
            }];
        }
        
        return order;
      });
      
      setOrders(enhancedOrders);
    } else {
      console.log("No orders found, trying to fetch from cart API");
      
      // Try fetching from cart API as fallback
      const cartResponse = await axios.get(`${API_BASE_URL}/api/keranjang`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Cart data response:", cartResponse);
      
      // Check if we got cart data
      if (cartResponse.data && 
          (cartResponse.data.data || 
           (Array.isArray(cartResponse.data) && cartResponse.data.length > 0))) {
        
        const cartItems = cartResponse.data.data || cartResponse.data;
        console.log("Cart items found:", cartItems);
        
        if (cartItems.length > 0) {
          // Enhance cart items with product data if possible
          const enhancedCartItems = cartItems.map(item => {
            if (item.produk) {
              return {
                ...item,
                nama_produk: item.produk.nama || item.produk.name || item.nama_produk || 'Product',
                gambar: item.produk.gambar || item.produk.image || item.gambar
              };
            }
            return item;
          });
          
          // Create a temporary order from cart items
          const tempOrder = {
            transaksi_id: 'temp-' + Date.now(),
            id: 'temp-' + Date.now(),
            keranjang: enhancedCartItems,
            status: 'pending',
            total: enhancedCartItems.reduce((sum, item) => {
              const price = parseFloat(item.harga) || 0;
              const quantity = parseInt(item.quantity) || 1;
              return sum + (price * quantity);
            }, 0),
            created_at: new Date().toISOString()
          };
          
          console.log("Created temporary order from cart:", tempOrder);
          setOrders([tempOrder]);
        }
      }
    }
    
    setLoading(false);
  } catch (err) {
    console.error("Error fetching orders:", err);
    
    // More detailed error logging
    if (err.response) {
      console.error("Error response:", err.response.data);
      console.error("Error status:", err.response.status);
    }
    
    setError('Failed to load order history. Please try again later.');
    setLoading(false);
    
    // Try to recover with cart data from localStorage as last resort
    try {
      const cartItems = localStorage.getItem('cartItems');
      if (cartItems) {
        const parsedItems = JSON.parse(cartItems);
        if (parsedItems && parsedItems.length > 0) {
          console.log("Creating order from localStorage cart items as error recovery");
          
          // Create a temporary order object
          const tempOrder = {
            transaksi_id: 'temp-' + Date.now(),
            id: 'temp-' + Date.now(),
            keranjang: parsedItems,
            status: 'pending',
            total: parsedItems.reduce((sum, item) => {
              const price = parseFloat(item.harga) || 0;
              const quantity = parseInt(item.quantity) || 1;
              return sum + (price * quantity);
            }, 0),
            created_at: new Date().toISOString()
          };
          
          setOrders([tempOrder]);
        }
      }
    } catch (cartErr) {
      console.error("Failed to recover with cart items:", cartErr);
    }
  }
};

// Improved fetchOrderDetails function with better debugging and product data extraction
const fetchOrderDetails = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Handle temporary orders from cart
    if (id && id.startsWith('temp-')) {
      console.log("Detected temporary order ID:", id);
      
      // Get cart items from localStorage
      const cartItemsStr = localStorage.getItem('cartItems');
      
      if (cartItemsStr) {
        const cartItems = JSON.parse(cartItemsStr);
        console.log("Found cart items for temp order:", cartItems);
        
        // Enhance cart items with better product data
        const enhancedCartItems = cartItems.map(item => {
          return {
            nama_produk: item.nama_produk || item.produk?.nama || item.nama || item.name || 'Product',
            ukuran: item.ukuran || item.size || '-',
            quantity: item.quantity || item.jumlah || 1,
            harga: item.harga || item.price || 0,
            gambar: item.gambar || item.image || item.produk?.gambar
          };
        });
        
        // Calculate total from cart items
        const subtotal = enhancedCartItems.reduce((sum, item) => {
          const price = parseFloat(item.harga) || 0;
          const quantity = parseInt(item.quantity) || 1;
          return sum + (price * quantity);
        }, 0);
        
        const deliveryFee = 10000; // Default delivery fee
        
        // Create temporary order object
        const tempOrderDetails = {
          transaksi_id: id,
          status: 'pending',
          created_at: new Date().toISOString(),
          keranjang: enhancedCartItems,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: subtotal + deliveryFee
        };
        
        console.log("Created enhanced temporary order:", tempOrderDetails);
        setOrderDetails(tempOrderDetails);
        setLoading(false);
        return;
      }
    }
    
    // Log API call for debugging
    console.log(`Fetching order details from API for ID: ${id}`);
    
    // Fetch data from the backend API
    const response = await axios.get(`${API_BASE_URL}/api/transaksi/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Raw order details response:", response);
    
    // Handle different response structures with better inspection
    let orderData = null;
    
    if (response.data) {
      console.log("Response data structure:", Object.keys(response.data));
      
      if (response.data.data) {
        console.log("Using response.data.data");
        orderData = response.data.data;
      } else {
        console.log("Using direct response.data");
        orderData = response.data;
      }
    }
    
    console.log("Processed order data:", orderData);
    
    // Enhance order data with better product detection
    if (orderData) {
      // If this order has no keranjang/items but has products data
      if ((!orderData.keranjang || !Array.isArray(orderData.keranjang) || orderData.keranjang.length === 0)) {
        console.log("Order has no keranjang data, checking for alternative product data");
        
        // Check for products data in various possible locations
        if (orderData.produk) {
          console.log("Found produk in order data");
          
          // Create keranjang from produk data
          orderData.keranjang = Array.isArray(orderData.produk) ? 
            orderData.produk.map(p => ({
              nama_produk: p.nama || p.name,
              ukuran: p.ukuran || p.size || '-',
              quantity: p.quantity || p.jumlah || 1,
              harga: p.harga || p.price || 0,
              gambar: p.gambar || p.image
            })) : 
            [{
              nama_produk: orderData.produk.nama || orderData.produk.name,
              ukuran: orderData.produk.ukuran || orderData.produk.size || '-',
              quantity: orderData.produk.quantity || orderData.produk.jumlah || 1,
              harga: orderData.produk.harga || orderData.produk.price || 0,
              gambar: orderData.produk.gambar || orderData.produk.image
            }];
        } else if (orderData.items && Array.isArray(orderData.items)) {
          console.log("Found items array in order data");
          orderData.keranjang = orderData.items;
        } else if (orderData.products && Array.isArray(orderData.products)) {
          console.log("Found products array in order data");
          orderData.keranjang = orderData.products.map(p => ({
            nama_produk: p.nama || p.name,
            ukuran: p.ukuran || p.size || '-',
            quantity: p.quantity || p.jumlah || 1,
            harga: p.harga || p.price || 0,
            gambar: p.gambar || p.image
          }));
        } else if (orderData.details) {
          console.log("Found details in order data");
          orderData.keranjang = Array.isArray(orderData.details) ? 
            orderData.details : [orderData.details];
        }
      }
      
      // If we have keranjang data, enhance it further
      if (orderData.keranjang && Array.isArray(orderData.keranjang)) {
        console.log("Enhancing keranjang data");
        
        orderData.keranjang = orderData.keranjang.map(item => {
          // Try to extract better product name and data
          return {
            ...item,
            nama_produk: item.nama_produk || item.produk?.nama || item.nama || item.name || 'Product',
            gambar: item.gambar || item.image || item.produk?.gambar
          };
        });
      }
    }
    
    setOrderDetails(orderData);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching order details:', err);
    
    // More detailed error logging
    if (err.response) {
      console.error("Error response:", err.response.data);
      console.error("Error status:", err.response.status);
    }
    
    // More descriptive error messages
    if (err.response && err.response.status === 404) {
      setError('Order not found. This order may have been deleted or you might not have permission to view it.');
    } else if (err.response && err.response.status === 401) {
      setError('Your session has expired. Please log in again.');
      // Optionally redirect to login page
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setError('Failed to load order details. Please try again later.');
    }
    
    setLoading(false);
  }
};

  // Function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_BASE_URL}/storage/${imagePath}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'on deliver':
        return 'bg-blue-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'on process':
        return 'bg-yellow-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'pending':
        return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'success':
        return 'bg-blue-400 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'failed':
        return 'bg-red-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      default:
        return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md inline-block';
    }
  };

  const formatStatusText = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'on deliver':
        return 'ON DELIVERY';
      case 'on process':
        return 'COOKING';
      default:
        return status.toUpperCase();
    }
  };

  // Helper function to extract items from order - directly from CustomerOrder.jsx
  // Improved getOrderItems function for better data extraction
const getOrderItems = (order) => {
  if (!order) return [];
  
  // Debug the incoming data structure
  console.log("Processing order data:", order);
  
  // Case 1: If order has keranjang array
  if (order.keranjang && Array.isArray(order.keranjang)) {
    return order.keranjang.map(item => {
      console.log("Processing keranjang item:", item);
      
      // Try to extract product name from different possible locations in the data structure
      let productName = 'Unknown Product';
      
      if (item.nama_produk) {
        productName = item.nama_produk;
      } else if (item.produk && item.produk.nama) {
        productName = item.produk.nama;
      } else if (item.nama) {
        productName = item.nama;
      } else if (item.name) {
        productName = item.name;
      }
      
      return {
        nama: productName,
        ukuran: item.ukuran || item.size || '-',
        jumlah: item.quantity || item.jumlah || 1,
        harga: item.harga || item.price || 0,
        gambar: item.gambar || item.image || (item.produk ? item.produk.gambar : null)
      };
    });
  }
  
  // Case 2: If order has items array
  if (order.items && Array.isArray(order.items)) {
    return order.items.map(item => {
      console.log("Processing items array item:", item);
      
      let productName = 'Unknown Product';
      
      if (item.nama_produk) {
        productName = item.nama_produk;
      } else if (item.produk && item.produk.nama) {
        productName = item.produk.nama;
      } else if (item.nama) {
        productName = item.nama;
      } else if (item.name) {
        productName = item.name;
      }
      
      return {
        nama: productName,
        ukuran: item.ukuran || item.size || '-',
        jumlah: item.quantity || item.jumlah || 1,
        harga: item.harga || item.price || 0,
        gambar: item.gambar || item.image || (item.produk ? item.produk.gambar : null)
      };
    });
  }
  
  // Case 3: If order has products array
  if (order.products && Array.isArray(order.products)) {
    return order.products.map(item => {
      console.log("Processing products array item:", item);
      
      let productName = 'Unknown Product';
      
      if (item.nama_produk) {
        productName = item.nama_produk;
      } else if (item.produk && item.produk.nama) {
        productName = item.produk.nama;
      } else if (item.nama) {
        productName = item.nama;
      } else if (item.name) {
        productName = item.name;
      }
      
      return {
        nama: productName,
        ukuran: item.ukuran || item.size || '-',
        jumlah: item.quantity || item.jumlah || 1,
        harga: item.harga || item.price || 0,
        gambar: item.gambar || item.image || (item.produk ? item.produk.gambar : null)
      };
    });
  }
  
  // Case 4: If order has details that might contain product info
  if (order.details && typeof order.details === 'object') {
    const details = Array.isArray(order.details) ? order.details : [order.details];
    return details.map(item => {
      console.log("Processing details object item:", item);
      
      let productName = 'Unknown Product';
      
      if (item.nama_produk) {
        productName = item.nama_produk;
      } else if (item.produk && item.produk.nama) {
        productName = item.produk.nama;
      } else if (item.nama) {
        productName = item.nama;
      } else if (item.name) {
        productName = item.name;
      }
      
      return {
        nama: productName,
        ukuran: item.ukuran || item.size || '-',
        jumlah: item.quantity || item.jumlah || 1,
        harga: item.harga || item.price || 0,
        gambar: item.gambar || item.image || (item.produk ? item.produk.gambar : null)
      };
    });
  }
  
  // Case 5: If order itself is an item
  if (order.nama_produk || order.name || (order.produk && order.produk.nama)) {
    console.log("Order itself seems to be a product item:", order);
    
    let productName = 'Unknown Product';
    
    if (order.nama_produk) {
      productName = order.nama_produk;
    } else if (order.produk && order.produk.nama) {
      productName = order.produk.nama;
    } else if (order.nama) {
      productName = order.nama;
    } else if (order.name) {
      productName = order.name;
    }
    
    return [{
      nama: productName,
      ukuran: order.ukuran || order.size || '-',
      jumlah: order.quantity || order.jumlah || 1,
      harga: order.harga || order.price || 0,
      gambar: order.gambar || order.image || (order.produk ? order. produk.gambar : null)
    }];
  }
  
  // If we get here, we couldn't find product data in the order
  console.warn("Could not find product data in order:", order);
  return [];
};
  
  // Calculate totals for the order items
  const calculateTotals = (items) => {
    if (!items || items.length === 0) return { subtotal: 0, total: 0 };
    
    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.harga) || 0;
      const quantity = parseInt(item.jumlah) || 1;
      return sum + (price * quantity);
    }, 0);
    
    const deliveryFee = 10000; // Default delivery fee
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total };
  };

  const handleBack = () => {
    navigate('/customer/order');
  };

  const handleReorder = () => {
    if (!orderDetails) return;
    
    // Add items to cart and navigate to cart
    const items = getOrderItems(orderDetails);
    
    try {
      localStorage.setItem('cartItems', JSON.stringify(items));
      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error adding items to cart:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div
          className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
          style={{
            backgroundImage: `url(${aksen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
        </div>
        <CustomerSidebar activePage="order" />
        <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6 flex items-center justify-center">
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div
          className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
          style={{
            backgroundImage: `url(${aksen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
        </div>
        <CustomerSidebar activePage="order" />
        <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-lg text-red-600">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs"
            >
              <FaArrowLeft className="mr-2 text-xs" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If orderDetails exists but doesn't have proper data, calculate totals
  const orderTotals = orderDetails?.total ? 
    { 
      subtotal: orderDetails.subtotal || 0, 
      deliveryFee: orderDetails.deliveryFee || 10000,
      total: orderDetails.total || 0 
    } : 
    calculateTotals(getOrderItems(orderDetails));

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
        {/* Header with Order Detail and Customer badge */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Order Detail</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>

        {/* Main container - Order section and content below */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Order Heading */}
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">Order</h2>
          </div>
          
          {/* Red divider line - thinner */}
          <div className="h-0.5 bg-red-800"></div>
          
          {/* Order List Table Header */}
          <div className="flex bg-red-800 text-white p-3 text-sm">
            <div className="w-16 text-center">NO</div>
            <div className="flex-1">ORDER DETAIL</div>
          </div>
          
          {/* Content section */}
          <div className="p-4">
            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs"
              >
                <FaArrowLeft className="mr-2 text-xs" />
                Back to Orders
              </button>
            </div>
            
            {/* Order Details and Tracking */}
            <div className="flex flex-wrap gap-6">
              {/* Left column - Tracking */}
              <div className="w-full md:w-1/3">
                <div className="bg-white p-3 rounded-lg border-2 border-red-800">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Tracking Order</h3>
                  
                  {/* Show different views based on order status */}
                  {orderDetails?.status?.toLowerCase() === 'pending' ? (
                    <div className="border-2 border-red-800 rounded-lg p-3 mb-3">
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                          <FaHome className="text-white text-xl" />
                        </div>
                        <div className="mt-2 text-yellow-500 font-bold text-sm">Awaiting Confirmation</div>
                        <p className="text-gray-500 text-xs text-center mt-2">
                          Your order is pending confirmation from the restaurant.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Map placeholder with border */}
                      <div className="border-2 border-red-800 rounded-lg overflow-hidden mb-3">
                        <div className="w-full h-48 bg-gray-100 relative">
                          {/* Restaurant marker */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                                <FaHome className="text-white" />
                              </div>
                              <div className="mt-1 text-red-800 font-bold text-xs">Kebuli Mutiara</div>
                            </div>
                          </div>
                          
                          {/* Customer marker */}
                          <div className="absolute bottom-8 left-1/4">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                              <FaUser className="text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Driver info - only show if status is appropriate */}
                  {orderDetails?.status?.toLowerCase() !== 'pending' && (
                    <>
                      <div className="border-2 border-red-800 rounded-lg p-3 mb-3 flex items-center justify-center">
                        <div className="text-red-800 mr-2">
                          <FaUser className="text-lg" />
                        </div>
                        <span className="text-sm font-bold">{orderDetails?.driver?.name || 'Driver'}</span>
                      </div>
                      
                      {/* Driver contact */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border-2 border-red-800 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Driver Phone</p>
                          <p className="text-xs">{orderDetails?.driver?.phone || 'N/A'}</p>
                        </div>
                        <div className="border-2 border-red-800 rounded-lg p-2">
                          <p className="text-xs text-gray-500">Delivery Time</p>
                          <p className="text-xs">{orderDetails?.driver?.deliveryTime || 'Est. 30-45 min'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Right column - Order Details */}
              <div className="w-full md:w-3/5 flex-1">
                <div className="bg-white p-3 rounded-lg border-2 border-red-800">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Details</h3>
                  <div className="border-2 border-red-800 rounded-lg p-3">
                    {/* Order details */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Order id</span>
                        <span className="text-xs font-bold">#{orderDetails?.transaksi_id || id}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Date</span>
                        <span className="text-xs font-bold">
                          {orderDetails?.created_at
                            ? new Date(orderDetails.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Status</span>
                        <span className={getStatusBadgeClass(orderDetails?.status)}>
                          {formatStatusText(orderDetails?.status)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Item</span>
                        <span className="text-xs font-bold">{getOrderItems(orderDetails).length}</span>
                      </div>
                    </div>
                    
                    <div className="w-full border-t border-gray-200 my-2"></div>
                    
                    {/* Order Items */}
                    {getOrderItems(orderDetails).map((item, index) => (
                      <div key={index} className="flex py-2 border-b border-gray-200 last:border-b-0">
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
                          {item.ukuran && <p className="text-xs text-gray-500">Size: {item.ukuran}</p>}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs">{item.jumlah}x</span>
                          <span className="text-xs font-bold">
                            Rp. {(typeof item.harga === 'number' 
                              ? item.harga.toLocaleString('id-ID') 
                              : parseFloat(item.harga || 0).toLocaleString('id-ID'))}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {getOrderItems(orderDetails).length === 0 && (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">No items in this order</p>
                      </div>
                    )}
                    
                    {/* Payment Summary */}
                    <div className="mt-3">
                      <h4 className="text-xs font-bold mb-2">Payment</h4>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">Subtotal</span>
                        <span className="text-xs font-bold">
                          Rp. {orderTotals.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">Delivery Fee</span>
                        <span className="text-xs font-bold">
                          Rp. {orderTotals.deliveryFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-700">Total</span>
                        <span className="text-xs font-bold">
                          Rp. {orderTotals.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {/* More flexible button display logic */}
                      {['delivered', 'success', 'completed'].includes(orderDetails?.status?.toLowerCase()) && (
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={handleReorder}
                            className="bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-medium w-full"
                          >
                            REORDER
                          </button>
                        </div>
                      )}
                      
                      {/* Special message for temporary orders */}
                      {id && id.startsWith('temp-') && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-700 text-center">
                            This is a temporary order. Please wait for confirmation from the restaurant.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetail;