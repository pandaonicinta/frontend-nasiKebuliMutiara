import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';
import axios from 'axios';

const CustomerOrder = () => {
  const navigate = useNavigate();
  const customerName = localStorage.getItem('userName') || 'Customer';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    console.log("Current user role in CustomerOrder:", userRole); // Debug logging
    
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      console.log("Invalid role detected, redirecting to home"); // Debug logging
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await axios.get('http://kebabmutiara.xyz/api/transaksi', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log("Orders data received:", response.data);
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to load order history. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to format status label based on API response
  const formatStatus = (status) => {
    const statusMap = {
      'bayar': 'Payment Pending',
      'bayar_berhasil': 'Payment Completed',
      'bayar_gagal': 'Payment Failed',
      'masak': 'Cooking',
      'otw': 'On The Way',
      'sampai': 'Delivered',
      'selesai': 'Completed'
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
      return dateString;
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/customer/order/${orderId}`);
  };

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
            </div>
          )}

          {/* No orders state */}
          {!loading && !error && orders.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-600">You don't have any orders yet.</p>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && orders.map((order, index) => (
            <div key={order.id} className="border-b border-gray-200 last:border-b-0">
              <div className="flex p-3">
                <div className="w-16 text-center">{index + 1}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start border-2 border-red-800 rounded-lg p-3 mb-4">
                    <div className="w-full flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="bg-red-800 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm font-bold">{formatStatus(order.status)}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {order.status === 'sampai' || order.status === 'selesai' ? 'Enjoy your meal' : 'Thank you for your order'}
                        </span>
                      </div>
                      <span className="text-xs">{formatDate(order.created_at)}</span>
                    </div>
                    
                    {/* Divider between status and order items */}
                    <div className="w-full h-px bg-gray-300 my-3"></div>

                    {/* Order Items */}
                    {order.items && order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="w-full flex items-center mt-2">
                        <div className="w-10 mr-3">
                          {/* Empty column for alignment */}
                        </div>
                        <div className="w-12 h-12 mr-3">
                          <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.gambar || '/api/placeholder/100/100'}
                              alt={item.nama}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/100/100';
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
                            Rp. {item.harga?.toLocaleString('id-ID') || '0'}
                          </div>
                        </div>
                        <div className="w-28 text-right">
                          <button
                            onClick={() => handleViewDetails(order.id)}
                            className="text-xs text-white bg-red-800 px-3 py-1 rounded mt-1 inline-block"
                          >
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* If there are no items in the order */}
                    {(!order.items || order.items.length === 0) && (
                      <div className="w-full text-center py-2">
                        <p className="text-sm text-gray-500">No items in this order</p>
                      </div>
                    )}
                    
                    {/* Total amount */}
                    <div className="w-full flex justify-end mt-4 pt-2 border-t border-gray-200">
                      <div className="text-sm font-bold">
                        Total: Rp. {order.total?.toLocaleString('id-ID') || '0'}
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