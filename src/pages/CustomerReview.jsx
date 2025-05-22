import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';
import axios from 'axios';
import defaultImage from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz/api';

const CustomerReview = () => {
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

        const response = await axios.get(`${API_BASE_URL}/ulasan`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const ordersData = response.data;

        if (!Array.isArray(ordersData) || ordersData.length === 0) {
          setError('You have no delivered orders yet.');
          setOrders([]);
        } else {
          setOrders(ordersData);
          setError(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load delivered orders.');
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
    return `${API_BASE_URL.replace('/api', '')}/storage/${imagePath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getOrderDate = (order) => {
    return (
      order.tanggal_pembelian ||
      null
    );
  };

  const getOrderItems = (order) => {
    if (!order || !order.keranjang) return [];
    return order.keranjang.map(item => ({
      nama: item.nama_produk || 'Unknown',
      ukuran: item.ukuran || '-',
      jumlah: item.quantity || 1,
      harga: item.harga || 0,
      gambar: item.gambar || null,
      keranjang_id: item.keranjang_id,
      israted: item.israted,
      rating: item.rating?.rating_value || null,
      comment: item.rating?.comment || '',
    }));
  };

  const getOrderId = (order) => order.transaksi_id || order.id || '';

  const handleWriteReview = (keranjangId, item) => {
    if (item.rating) {
      alert(`You already submitted a review:\n\nRating: ${item.rating}\nComment: ${item.comment || '(no comment)'}`);
    } else {
      navigate(`/customer/review/${keranjangId}`, { state: { product: item } });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{ backgroundImage: `url(${aksen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <CustomerSidebar activePage="review" />

      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Review</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">My Review</h2>
          </div>
          <div className="h-0.5 bg-red-800"></div>

          <div className="flex bg-red-800 text-white p-3 text-sm">
            <div className="w-16 text-center">NO</div>
            <div className="flex-1">ORDER</div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
              <p className="mt-2 text-gray-600">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              {error !== 'You have no delivered orders yet.' && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-red-800 text-white px-4 py-2 rounded text-sm"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You have no delivered orders to review.</div>
          ) : (
            orders.map((order, index) => {
              const orderId = getOrderId(order);
              return (
                <div
                  key={orderId || index}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex p-3">
                    <div className="w-16 text-center">{index + 1}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start border-2 border-red-800 rounded-lg p-3 mb-4">
                        <div className="w-full flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className="bg-red-800 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm font-bold">Delivered</span>
                            <span className="text-xs text-gray-500 ml-2">Enjoy your meal</span>
                          </div>
                          <span className="text-xs">{formatDate(getOrderDate(order))}</span>
                        </div>

                        <div className="w-full h-px bg-gray-300 my-3"></div>

                        {getOrderItems(order).map((item, itemIndex) => (
                          <div key={itemIndex} className="w-full flex items-center mt-2">
                            <div className="w-10 mr-3" />
                            <div className="w-12 h-12 mr-3">
                              <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={getImageUrl(item.gambar)}
                                  alt={item.nama}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = defaultImage; }}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-bold">{item.nama}</h4>
                              <p className="text-xs text-gray-500">Size: {item.ukuran}</p>
                            </div>
                            <div className="w-28 text-right">
                              <button
                                onClick={() => handleWriteReview(item.keranjang_id, item)}
                                className="text-xs text-white bg-red-800 px-6 py-1 rounded mt-1 inline-block"
                              >
                                {item.rating ? 'VIEW REVIEW' : 'REVIEW'}
                              </button>
                            </div>
                          </div>
                        ))}

                        {getOrderItems(order).length === 0 && (
                          <div className="w-full text-center py-2">
                            <p className="text-sm text-gray-500">No items in this order</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;
