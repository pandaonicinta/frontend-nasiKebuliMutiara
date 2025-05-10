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
  const [summaryData, setSummaryData] = useState({
    totalOrders: 0,
    delivered: 0,
    onDelivery: 0,
    pending: 0,
    cooking: 0
  });
  
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
      navigate('/');
    } else {
      fetchOrdersData();
    }
  }, [navigate]);
  
  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const summaryResponse = await axios.get('http://kebabmutiara.xyz/api/dashboard', { headers });
      console.log("Dashboard summary response:", summaryResponse.data);
      const totalOrders = summaryResponse.data.total_order || 0;
      const delivered = summaryResponse.data.total_delivered || 0;
      const ordersResponse = await axios.get('http://kebabmutiara.xyz/api/dashboard/order', { headers });
      console.log("Orders API response:", ordersResponse.data);
      let ordersData = [];

      if (Array.isArray(ordersResponse.data)) {
        ordersData = ordersResponse.data;
      } else if (ordersResponse.data && ordersResponse.data.data && Array.isArray(ordersResponse.data.data)) {
        ordersData = ordersResponse.data.data;
      } else if (typeof ordersResponse.data === 'object') {
        const possibleArrays = Object.values(ordersResponse.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          ordersData = possibleArrays[0];
        }
      }
      
      const processedOrders = ordersData.map(order => {
        return {
          transaksi_id: order.transaksi_id || order.id,
          created_at: order.created_at || order.tanggal_pembelian,
          status: order.status || 'PENDING',
          total: order.total || order.total_harga || 0,
          alamat: order.alamat || {},
          customer_name: order.alamat?.user?.name || order.nama_pembeli || 'N/A'
        };
      });
      
      setOrders(processedOrders);

      let pending = 0;
      let cooking = 0;
      let onDelivery = 0;
      
      processedOrders.forEach(order => {
        const status = (order.status || '').toUpperCase();
        
        if (status === 'PENDING' || status === 'NEW ORDER') {
          pending++;
        } else if (status === 'MASAK' || status === 'COOKING') {
          cooking++;
        } else if (status === 'OTW' || status === 'ON DELIVERY') {
          onDelivery++;
        }
      });

      const calculatedOnDelivery = onDelivery || (totalOrders - delivered - pending - cooking);
      
      setSummaryData({
        totalOrders,
        delivered,
        onDelivery: calculatedOnDelivery,
        pending,
        cooking
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Format Error';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
    
    switch (status.toUpperCase()) {
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
    if (!status) return 'UNKNOWN';
    
    switch (status.toUpperCase()) {
      case 'SAMPAI': return 'DELIVERED';
      case 'OTW': return 'ON DELIVERY';
      case 'MASAK': return 'COOKING';
      case 'PENDING': return 'NEW ORDER';
      default: return status;
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleStatusChange = async (orderId, currentStatus) => {
    if (!currentStatus) {
      setError('Cannot update order with unknown status');
      return;
    }
    
    try {
      let nextEndpoint = '';
      let nextStatus = '';
      
      switch (currentStatus.toUpperCase()) {
        case 'PENDING':
        case 'NEW ORDER':
          nextEndpoint = `http://kebabmutiara.xyz/api/masak/${orderId}`;
          nextStatus = 'COOKING';
          break;
        case 'MASAK':
        case 'COOKING':
          nextEndpoint = `http://kebabmutiara.xyz/api/otw/${orderId}`;
          nextStatus = 'ON DELIVERY';
          break;
        case 'OTW':
        case 'ON DELIVERY':
          nextEndpoint = `http://kebabmutiara.xyz/api/sampai/${orderId}`;
          nextStatus = 'DELIVERED';
          break;
        default:
          setError(`Unknown order status: ${currentStatus}`);
          return; 
      }
      
      if (nextEndpoint) {
        const token = localStorage.getItem('token');
        await axios.get(nextEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.transaksi_id === orderId 
              ? { ...order, status: nextStatus === 'ON DELIVERY' ? 'OTW' : nextStatus === 'DELIVERED' ? 'SAMPAI' : 'MASAK' } 
              : order
          )
        );

        if (currentStatus.toUpperCase() === 'PENDING' || currentStatus.toUpperCase() === 'NEW ORDER') {
          setSummaryData(prev => ({
            ...prev,
            pending: Math.max(0, prev.pending - 1),
            cooking: prev.cooking + 1
          }));
        } else if (currentStatus.toUpperCase() === 'MASAK' || currentStatus.toUpperCase() === 'COOKING') {
          setSummaryData(prev => ({
            ...prev,
            cooking: Math.max(0, prev.cooking - 1),
            onDelivery: prev.onDelivery + 1
          }));
        } else if (currentStatus.toUpperCase() === 'OTW' || currentStatus.toUpperCase() === 'ON DELIVERY') {
          setSummaryData(prev => ({
            ...prev,
            onDelivery: Math.max(0, prev.onDelivery - 1),
            delivered: prev.delivered + 1
          }));
        }
 
        fetchOrdersData();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

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
      <AdminSidebar activePage="orders" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Order Management</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">TOTAL ORDERS</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.totalOrders}</h2>
                <div className="p-2 bg-gray-800 text-white rounded">
                  <FaUsers className="text-xs" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">NEW ORDERS</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.pending}</h2>
                <div className="p-2 bg-red-500 text-white rounded">
                  <FaUsers className="text-xs" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">COOKING</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.cooking}</h2>
                <div className="p-2 bg-yellow-500 text-white rounded">
                  <FaUsers className="text-xs" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">ON DELIVERY</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.onDelivery}</h2>
                <div className="p-2 bg-blue-500 text-white rounded">
                  <FaUsers className="text-xs" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">DELIVERED</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.delivered}</h2>
                <div className="p-2 bg-green-500 text-white rounded">
                  <FaUsers className="text-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Table */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Order List</h3>
            <div>
              {error && <span className="text-red-500 text-xs mr-4">{error}</span>}
              <button 
                onClick={() => fetchOrdersData()} 
                className="bg-red-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-900 transition"
              >
                REFRESH
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
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
                    <th className="py-2 px-3 text-xs">DETAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No orders found. {summaryData.totalOrders > 0 ? 
                        `There should be ${summaryData.totalOrders} orders according to the dashboard. Please check the API connection.` : 
                        'No orders are available at this time.'}
                      </td>
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
                        <td className="py-2 px-3 text-xs text-red-800">{order.customer_name}</td>
                        <td className="py-2 px-3 text-xs text-red-800">{formatCurrency(order.total)}</td>
                        <td className="py-2 px-3 flex justify-center">
                          <span className={getStatusBadgeClass(order.status)}>
                            {getDisplayStatus(order.status)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {order.status && ['PENDING', 'NEW ORDER', 'MASAK', 'COOKING', 'OTW', 'ON DELIVERY'].some(
                            s => order.status.toUpperCase().includes(s)
                          ) && (
                            <button
                              onClick={() => handleStatusChange(order.transaksi_id, order.status)}
                              className="bg-red-800 text-white text-xs px-2 py-1 rounded-md hover:bg-red-900 transition"
                            >
                              {(order.status.toUpperCase() === 'PENDING' || order.status.toUpperCase() === 'NEW ORDER') ? 'Start Cooking' : 
                               (order.status.toUpperCase() === 'MASAK' || order.status.toUpperCase() === 'COOKING') ? 'Send Delivery' : 
                               'Mark Delivered'}
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