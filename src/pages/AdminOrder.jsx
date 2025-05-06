import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaEye } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

const AdminOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch orders from the API
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://kebabmutiara.xyz/api/dashboard/order', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(response.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Rp. ${parseInt(amount).toLocaleString('id-ID')}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'SAMPAI':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
      case 'ON DELIVERY':
      case 'OTW':
        return 'bg-blue-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      case 'NEW ORDER':
      case 'PENDING':
        return 'bg-red-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      case 'COOKING':
      case 'MASAK':
        return 'bg-yellow-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      default:
        return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
    }
  };

  const getDisplayStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'SAMPAI': return 'DELIVERED';
      case 'OTW': return 'ON DELIVERY';
      case 'MASAK': return 'COOKING';
      case 'PENDING': return 'NEW ORDER';
      default: return status;
    }
  };

  const handleOrderClick = (orderId) => {
    // Navigate to order detail page with the specific order ID
    navigate(`/admin/orders/${orderId}`);
  };

  const handleStatusChange = async (orderId, currentStatus) => {
    try {
      let nextEndpoint = '';
      
      // Determine next status based on current status
      switch (currentStatus?.toUpperCase()) {
        case 'PENDING':
          nextEndpoint = `http://kebabmutiara.xyz/api/masak/${orderId}`;
          break;
        case 'MASAK':
          nextEndpoint = `http://kebabmutiara.xyz/api/otw/${orderId}`;
          break;
        case 'OTW':
          nextEndpoint = `http://kebabmutiara.xyz/api/sampai/${orderId}`;
          break;
        default:
          return; // No further status update possible
      }
      
      if (nextEndpoint) {
        await axios.get(nextEndpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Refresh orders after status update
        const response = await axios.get('http://kebabmutiara.xyz/api/dashboard/order', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
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
      <AdminSidebar activePage="orders" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        {/* Header with Order and Admin in a box */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Order</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Order Table - Improved styling with box and shadow */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Order</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-red-800 text-white text-center">
                    <th className="py-2 px-3 text-xs">ORDER ID</th>
                    <th className="py-2 px-3 text-xs">DATE</th>
                    <th className="py-2 px-3 text-xs">CUSTOMER NAME</th>
                    <th className="py-2 px-3 text-xs">AMOUNT</th>
                    <th className="py-2 px-3 text-xs">ORDER STATUS</th>
                    <th className="py-2 px-3 text-xs">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No orders found</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr 
                        key={order.transaksi_id} 
                        className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                      >
                        <td 
                          className="py-2 px-3 text-xs text-red-800 cursor-pointer"
                          onClick={() => handleOrderClick(order.transaksi_id)}
                        >
                          #{order.transaksi_id}
                        </td>
                        <td className="py-2 px-3 text-xs text-red-800">{formatDate(order.created_at)}</td>
                        <td className="py-2 px-3 text-xs text-red-800">{order.alamat?.user?.name || 'N/A'}</td>
                        <td className="py-2 px-3 text-xs text-red-800">{formatCurrency(order.total)}</td>
                        <td className="py-2 px-3 flex justify-center">
                          <span className={getStatusBadgeClass(order.status)}>
                            {getDisplayStatus(order.status)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {order.status && ['PENDING', 'MASAK', 'OTW'].includes(order.status.toUpperCase()) && (
                            <button
                              onClick={() => handleStatusChange(order.transaksi_id, order.status)}
                              className="bg-red-800 text-white text-xs px-2 py-1 rounded-md hover:bg-red-900 transition"
                            >
                              Update Status
                            </button>
                          )}
                          <button
                            onClick={() => handleOrderClick(order.transaksi_id)}
                            className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-md ml-2 hover:bg-gray-300 transition"
                          >
                            <FaEye className="inline text-xs mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrder;