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
    const fetchOrderDetails = async (id) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        // Fetch all orders from the single endpoint
        const response = await axios.get(`${API_BASE_URL}/api/transaksiAdmin/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let orders = response.data.data || response.data;
        
        // Handle if orders is not an array
        if (!Array.isArray(orders)) {
          orders = [orders];
        }

        // Find the specific order by transaksi_id
        const order = orders.find(o => 
          String(o.transaksi_id) === String(id)
        );

        if (!order) {
          throw new Error('Order not found');
        }

        // Process the order data according to your database structure
        const processedOrder = {
          transaksi_id: order.transaksi_id,
          tanggal_pembelian: order.tanggal_pembelian,
          nama_pembeli: order.nama_pembeli,
          total_harga: order.total_harga,
          status: order.status,
          alamat: order.alamat,
          keranjang: order.keranjang || []
        };

        // Process cart items if they exist
        if (processedOrder.keranjang && Array.isArray(processedOrder.keranjang)) {
          processedOrder.keranjang = processedOrder.keranjang.map((item) => ({
            keranjang_id: item.keranjang_id,
            nama_produk: item.nama_produk || item.produk?.nama_produk || item.produk?.nama || 'Unknown Product',
            ukuran: item.ukuran || item.produk?.ukuran || 'Regular',
            quantity: Number(item.quantity || item.jumlah) || 1,
            harga: Number(item.harga || item.produk?.harga) || 0,
            gambar: item.gambar || (item.produk?.gambar ? `${API_BASE_URL}/storage/${item.produk.gambar}` : null),
          }));
        }

        // Calculate subtotal from cart items
        const subtotal = processedOrder.keranjang.reduce(
          (sum, item) => sum + (item.harga * item.quantity),
          0
        );

        // Use delivery fee from order data or default
        const deliveryFee = Number(order.ongkir) || 10000;
        
        // Add calculated values
        processedOrder.subtotal = subtotal;
        processedOrder.deliveryFee = deliveryFee;
        processedOrder.calculatedTotal = subtotal + deliveryFee;

        setOrderDetails(processedOrder);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order detail:', err);
        setError(err.message || 'Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails(id);
    }
  }, [id, navigate]);

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/storage/${path}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    
    // Handle the specific format from your database: "24-May-2025 00:00"
    const parts = dateStr.split(' ');
    if (parts.length >= 1) {
      const datePart = parts[0];
      const [day, month, year] = datePart.split('-');
      
      if (day && month && year) {
        const monthNames = {
          'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
          'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
          'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
        };
        
        const fullMonth = monthNames[month] || month;
        const time = parts[1] || '00:00';
        
        return `${day} ${fullMonth} ${year}, ${time}`;
      }
    }
    
    // Fallback to regular date parsing
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

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
      case 'selesai':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'on deliver':
      case 'on delivery':
      case 'otw':
      case 'diantar':
        return 'bg-blue-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'on process':
      case 'cooking':
      case 'masak':
      case 'diproses':
        return 'bg-yellow-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'pending':
      case 'menunggu':
        return 'bg-orange-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'success':
      case 'berhasil':
        return 'bg-blue-400 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'failed':
      case 'gagal':
      case 'dibatalkan':
        return 'bg-red-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'new order':
      case 'pesanan baru':
        return 'bg-purple-500 text-white text-xs px-4 py-1 rounded-md inline-block';
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
      case 'diantar':
        return 'SEDANG DIKIRIM';
      case 'on process':
      case 'cooking':
      case 'masak':
      case 'diproses':
        return 'SEDANG DIMASAK';
      case 'delivered':
      case 'selesai':
        return 'SELESAI';
      case 'pending':
      case 'menunggu':
        return 'MENUNGGU';
      case 'success':
      case 'berhasil':
        return 'SUCCESS';
      case 'failed':
      case 'gagal':
      case 'dibatalkan':
        return 'FAILED';
      case 'new order':
      case 'pesanan baru':
        return 'NEW ORDER';
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
              Back to Orders
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
              Back to Orders
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
            <h2 className="text-base font-bold text-gray-800">Order Details</h2>
          </div>
          <div className="h-4 bg-red-800"></div>
          
          {/* Content section */}
          <div className="p-4">
            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleBack}
                className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
              >
                <FaArrowLeft className="mr-2 text-xs" />
                Back to Orders
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
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Order Information</h3>
                  
                  <div className="border-2 border-red-800 rounded-lg p-3">
                    <div className="mb-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Order ID</span>
                        <span className="text-xs font-bold">#{orderDetails.transaksi_id}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Date</span>
                        <span className="text-xs font-bold">{formatDate(orderDetails.tanggal_pembelian)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Total Items</span>
                        <span className="text-xs font-bold">{orderDetails.keranjang.length}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Customer</span>
                        <span className="text-xs font-bold">{orderDetails.nama_pembeli}</span>
                      </div>
                      
                      {/* Address Information */}
                      {orderDetails.alamat && (
                        <>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-700">Recipient</span>
                            <span className="text-xs font-bold">{orderDetails.alamat.nama_penerima}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-700">Phone</span>
                            <span className="text-xs font-bold">{orderDetails.alamat.no_telepon}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-700">Address Label</span>
                            <span className="text-xs font-bold">{orderDetails.alamat.label_alamat}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-700">Detail</span>
                            <span className="text-xs font-bold text-right max-w-xs">{orderDetails.alamat.detail}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-700">Area</span>
                            <span className="text-xs font-bold text-right max-w-xs">
                              {orderDetails.alamat.kelurahan}, {orderDetails.alamat.kecamatan}, {orderDetails.alamat.kabupaten}, {orderDetails.alamat.provinsi}
                            </span>
                          </div>
                          {orderDetails.alamat.catatan_kurir && (
                            <div className="flex justify-between mb-2">
                              <span className="text-xs text-gray-700">Courier Note</span>
                              <span className="text-xs font-bold text-right max-w-xs">{orderDetails.alamat.catatan_kurir}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="w-full border-t border-gray-200 mt-2"></div>
                    
                    {/* Order Items */}
                    <div className="mt-3">
                      <h4 className="text-xs font-bold mb-2">Order Items</h4>
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
                            <div className="flex-1 ">
                              <h4 className="text-xs font-bold">{item.nama_produk}</h4>
                              {/* <p className="text-xs text-gray-500">Size: {item.ukuran}</p> */}
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
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-bold mb-2">Payment Summary</h4>
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
                        <span className="text-xs font-bold text-gray-700">Total (Database)</span>
                        <span className="text-xs font-bold text-red-800">
                          Rp. {(Number(orderDetails.total_harga) || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {orderDetails.calculatedTotal !== Number(orderDetails.total_harga) && (
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">Total (Calculated)</span>
                          <span className="text-xs text-gray-500">
                            Rp. {(Number(orderDetails.calculatedTotal) || 0).toLocaleString('id-ID')}
                          </span>
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

export default AdminOrderDetail;