import React, { useState, useEffect } from 'react';
import { FaUsers, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';
import defaultImage from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz';

const AdminOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await axios.get(`${API_BASE_URL}/dashboard/order`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let order = response.data.data || response.data;

        // Process cart items
        order.keranjang = Array.isArray(order.keranjang) ? order.keranjang : [];
        order.keranjang = order.keranjang.map((item) => ({
          keranjang_id: item.keranjang_id,
          nama_produk:
            item.nama_produk ||
            item.produk?.nama_produk ||
            item.produk?.nama ||
            'Unknown',
          ukuran: item.ukuran || item.produk?.ukuran || '-',
          quantity: Number(item.quantity || item.jumlah) || 1,
          harga: Number(item.harga || item.produk?.harga) || 0,
          gambar:
            item.gambar ||
            (item.produk?.gambar
              ? `${API_BASE_URL}/storage/${item.produk.gambar}`
              : null),
        }));

        // Calculate totals
        const subtotal = order.keranjang.reduce(
          (sum, i) => sum + i.harga * i.quantity,
          0
        );
        const deliveryFee = 10000;

        order.subtotal = subtotal;
        order.deliveryFee = deliveryFee;
        order.total = subtotal + deliveryFee;

        setOrderDetails(order);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order detail:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id, navigate]);

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/storage/${path}`;
  };

  const getOrderDate = () => {
    if (!orderDetails) return null;
    return (
      orderDetails.created_at ||
      orderDetails.tanggal ||
      orderDetails.tanggal_pembelian ||
      null
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';

    const day = date.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'on deliver':
      case 'on delivery':
      case 'otw':
        return 'bg-blue-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'on process':
      case 'cooking':
      case 'masak':
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
    if (!status) return 'UNKNOWN';
    switch (status.toLowerCase()) {
      case 'on deliver':
      case 'on delivery':
      case 'otw':
        return 'ON DELIVERY';
      case 'on process':
      case 'cooking':
      case 'masak':
        return 'COOKING';
      default:
        return status.toUpperCase();
    }
  };

  const handleBack = () => {
    navigate('/admin/orders');
  };

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
        
        <AdminSidebar activePage="order" />

        <div className="relative z-10 flex-1 ml-52 p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
            <p className="mt-2 text-gray-600">Loading Order Details...</p>
          </div>
        </div>
      </div>
    );
  }

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
        
        <AdminSidebar activePage="order" />

        <div className="relative z-10 flex-1 ml-52 p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-lg text-red-600">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs"
            >
              <FaArrowLeft className="mr-2 text-xs" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
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
        
        <AdminSidebar activePage="order" />

        <div className="relative z-10 flex-1 ml-52 p-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-lg text-gray-600">Order not found</p>
            <button
              onClick={handleBack}
              className="mt-4 flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs"
            >
              <FaArrowLeft className="mr-2 text-xs" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      
      {/* Sidebar */}
      <AdminSidebar activePage="order" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Order Detail</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-xs" />
            <span className="text-xs font-medium">Admin</span>
          </div>
        </div>

        {/* Main container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">Order</h2>
          </div>
          <div className="h-4 bg-red-800"></div>
          
          {/* Content section */}
          <div className="p-4">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleBack}
                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs"
              >
                <FaArrowLeft className="mr-2 text-xs" />
                Back
              </button>
              
              <div className="flex-1 flex justify-between items-center bg-white p-3 rounded-lg border-2 border-red-800">
                <h3 className="text-sm font-bold text-gray-800">Order Status</h3>
                <span className={getStatusBadgeClass(orderDetails.status)}>
                  {formatStatusText(orderDetails.status)}
                </span>
              </div>
            </div>

            {/* Order Details */}
            <div className="flex flex-wrap gap-6">
              <div className="flex-1">
                <div className="bg-white p-3 rounded-lg border-2 border-red-800">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Details</h3>
                  
                  <div className="border-2 border-red-800 rounded-lg p-3">
                    <div className="mb-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Order id</span>
                        <span className="text-xs font-bold">#{orderDetails.transaksi_id || orderDetails.id}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Date</span>
                        <span className="text-xs font-bold">{formatDate(getOrderDate())}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Item</span>
                        <span className="text-xs font-bold">{orderDetails.keranjang.length}</span>
                      </div>
                      {orderDetails.user_name && (
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-gray-700">Customer</span>
                          <span className="text-xs font-bold">{orderDetails.user_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full border-t border-gray-200 mt-2"></div>
                    
                    {/* Order Items */}
                    {orderDetails.keranjang.length > 0 ? (
                      orderDetails.keranjang.map((item, index) => (
                        <div key={index} className="flex py-2 border-b border-gray-200 last:border-b-0">
                          <div className="w-12 h-12 mr-3">
                            <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                              <img 
                                src={getImageUrl(item.gambar)}
                                alt={item.nama_produk}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = defaultImage;
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-bold">{item.nama_produk}</h4>
                            <p className="text-xs text-gray-500">Size: {item.ukuran}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs">{item.quantity}x</span>
                            <span className="text-xs font-bold">
                              Rp. {(Number(item.harga) || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
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
                          Rp. {(Number(orderDetails.subtotal) || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">Delivery Fee</span>
                        <span className="text-xs font-bold">
                          Rp. {(Number(orderDetails.deliveryFee) || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Total</span>
                        <span className="text-xs font-bold">
                          Rp. {(Number(orderDetails.total) || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
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

export default AdminOrderDetail;