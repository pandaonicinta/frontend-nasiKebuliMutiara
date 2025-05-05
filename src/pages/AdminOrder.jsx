import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaEye } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminOrder = () => {
  const navigate = useNavigate();
  
  // Data for all orders
  const orders = [
    { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' },
    { id: '#123124', date: '1 January 2025, 12:00AM', customerName: 'Budi', amount: 'Rp. 75.000', status: 'ON DELIVERY' },
    { id: '#123125', date: '1 January 2025, 12:00AM', customerName: 'Cindy', amount: 'Rp. 120.000', status: 'NEW ORDER' },
    { id: '#123126', date: '1 January 2025, 12:00AM', customerName: 'Dedi', amount: 'Rp. 95.000', status: 'DELIVERED' },
    { id: '#123127', date: '1 January 2025, 12:00AM', customerName: 'Eka', amount: 'Rp. 150.000', status: 'DELIVERED' },
    { id: '#123128', date: '1 January 2025, 12:00AM', customerName: 'Fandi', amount: 'Rp. 85.000', status: 'DELIVERED' },
    { id: '#123129', date: '1 January 2025, 12:00AM', customerName: 'Gita', amount: 'Rp. 110.000', status: 'ON DELIVERY' },
    { id: '#123130', date: '1 January 2025, 12:00AM', customerName: 'Hadi', amount: 'Rp. 65.000', status: 'NEW ORDER' },
    { id: '#123131', date: '1 January 2025, 12:00AM', customerName: 'Indra', amount: 'Rp. 125.000', status: 'DELIVERED' },
    { id: '#123132', date: '1 January 2025, 12:00AM', customerName: 'Joko', amount: 'Rp. 100.000', status: 'DELIVERED' }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
      case 'ON DELIVERY':
        return 'bg-blue-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      case 'NEW ORDER':
        return 'bg-red-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      default:
        return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
    }
  };

  const handleOrderClick = (orderId) => {
    // Navigate to order detail page with the specific order ID
    // Remove # if it exists in the ID
    const cleanId = orderId.replace('#', '');
    navigate(`/admin/orders/${cleanId}`);
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
      <div className="relative z-10 flex-1 p-6">
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
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-red-800 text-white text-center">
                  <th className="py-2 px-3 text-xs">ORDER ID</th>
                  <th className="py-2 px-3 text-xs">DATE</th>
                  <th className="py-2 px-3 text-xs">CUSTOMER NAME</th>
                  <th className="py-2 px-3 text-xs">AMOUNT</th>
                  <th className="py-2 px-3 text-xs">ORDER STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-200 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <td className="py-2 px-3 text-xs text-red-800">{order.id}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{order.date}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{order.customerName}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{order.amount}</td>
                    <td className="py-2 px-3 flex justify-center">
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrder;