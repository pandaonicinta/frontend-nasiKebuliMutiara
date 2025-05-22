import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';
import axios from 'axios';
import defaultImage from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz';

const CustomerOrder = () => {
  const navigate = useNavigate();
  const customerName = localStorage.getItem('userName') || 'Customer';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await axios.get(`${API_BASE_URL}/api/transaksi`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let ordersData = [];
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        } else {
          throw new Error('Response data format unexpected');
        }

        if (ordersData.length === 0) {
          setError('You have no orders yet.');
          setOrders([]);
        } else {
          setOrders(ordersData);
          setError(null);
        }
      } catch (err) {
        setError(err.message || 'Failed to load order history. Please try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/storage/${imagePath}`;
  };

  const formatStatus = (status) => {
    const map = {
      pending: 'Payment Pending',
      success: 'Payment Completed',
      failed: 'Payment Failed',
      'on process': 'Cooking',
      'on deliver': 'On The Way',
      delivered: 'Delivered',
      completed: 'Completed'
    };
    return map[status] || status || 'Unknown';
  };

  // Fungsi formatDate dengan format "22-Mei-2025 21:45"
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      const day = date.getDate();
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  const getOrderId = (order) => order.transaksi_id || order.id || '';

  const handleViewDetails = (orderId) => {
    navigate(`/customer/order/${orderId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{ backgroundImage: `url(${aksen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <CustomerSidebar activePage="order" />

      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">My Order</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">My Order</h2>
          </div>
          <div className="h-0.5 bg-red-800"></div>

          <div className="flex bg-red-800 text-white p-3 text-sm">
            <div className="w-16 text-center">NO</div>
            <div className="flex-1">ORDER</div>
          </div>

          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
              <p className="mt-2 text-gray-600">Loading your orders...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              {error !== 'You have no orders yet.' && (
                <button onClick={() => window.location.reload()} className="mt-2 bg-red-800 text-white px-4 py-2 rounded text-sm">
                  Try Again
                </button>
              )}
              {error === 'You have no orders yet.' && (
                <button onClick={() => navigate('/menu')} className="mt-4 bg-red-800 text-white px-4 py-2 rounded text-sm">
                  Browse Menu
                </button>
              )}
            </div>
          )}

          {!loading && !error && orders.length > 0 && orders.map((order, index) => {
            const totalQuantity = order.keranjang?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;
            const totalHarga = order.total_harga 
              ? Number(order.total_harga) 
              : (order.keranjang?.reduce((sum, item) => sum + (Number(item.harga) || 0) * (Number(item.quantity) || 1), 0) || 0);

            const mostExpensiveItem = order.keranjang && order.keranjang.length > 0
              ? order.keranjang.reduce((prev, current) => {
                  const prevPrice = Number(prev.harga) || 0;
                  const currPrice = Number(current.harga) || 0;
                  return (currPrice > prevPrice) ? current : prev;
                })
              : null;

            const firstItem = order.keranjang && order.keranjang.length > 0 ? order.keranjang[0] : null;

            const tanggal = order.created_at || order.tanggal || order.tanggal_pembelian || null;

            return (
              <div key={getOrderId(order) || index} className="border-b border-gray-200 last:border-b-0">
                <div className="flex p-3">
                  <div className="w-16 text-center">{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start border-2 border-red-800 rounded-lg p-3 mb-4">
                      <div className="w-full flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="bg-red-800 w-6 h-6 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-sm font-bold text-black-500">{formatStatus(order.status)}</span>
                          <span className="text-xs text-gray-400">
                            {order.status === 'delivered' ? 'Enjoy your meal' : 'Thank you for your order'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(tanggal)}</span>
                      </div>

                      <div className="w-full h-px bg-gray-300 my-3"></div>

                      {mostExpensiveItem ? (
                        <div className="w-full flex items-center mt-2">
                          <div className="w-10 mr-3" />
                          <div className="w-12 h-12 mr-3">
                            <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={getImageUrl(mostExpensiveItem.gambar)}
                                alt={firstItem ? firstItem.nama_produk : 'Menu Image'}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = defaultImage; }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-bold">{firstItem ? firstItem.nama_produk : 'Unknown'}</h4>
                            <p className="text-xs text-gray-500">Size: {mostExpensiveItem.ukuran}</p>
                          </div>
                          <div className="flex flex-1 items-center justify-center">
                            <div className="shadow-inner px-3 py-1 rounded bg-white border border-gray-300 text-center text-xs w-12">
                              {totalQuantity}
                            </div>
                          </div>
                          <div className="text-center text-xs font-bold w-28">
                            Rp. {totalHarga.toLocaleString('id-ID')}
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
                      ) : (
                        <div className="w-full text-center py-2">
                          <p className="text-sm text-gray-500">No items in this order</p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrder;
