import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartPie, FaUsers, FaShoppingCart } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Check if user is logged in as admin
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  // Data for the dashboard
  const summaryData = {
    incomeToday: 'Rp. 3.750.000',
    totalOrders: 40,
    delivered: 23,
    totalCustomers: 23
  };

  const orderSummary = {
    totalOrder: 3,
    onDelivery: 1,
    delivered: 2
  };

  // Data for recent orders
  const recentOrders = [
    { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' },
    { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'ON DELIVERY' },
    { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'NEW ORDER' },
    { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' },
    { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' }
  ];

  // Data for performance chart
  const performanceData = [
    { name: 'Jul', value: 20 },
    { name: 'Aug', value: 30 },
    { name: 'Sep', value: 15 },
    { name: 'Oct', value: 25 },
    { name: 'Nov', value: 20 },
    { name: 'Dec', value: 18 }
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Background with red top 1/3 and accent pattern */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0" 
          style={{ 
            backgroundImage: `url(${aksen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
      </div>

      {/* Sidebar Component - Fixed Position */}
      <AdminSidebar activePage="dashboard" />

      {/* Main Content - With left margin to accommodate fixed sidebar */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        {/* Header with Dashboard and Admin in a box */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Dashboard</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Summary Cards - With shadow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Income Card */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">INCOME MONEY</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.incomeToday}</h2>
                <div className="p-2 bg-red-800 text-white rounded">
                  <FaChartPie className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Order Card */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">TOTAL ORDER</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.totalOrders}</h2>
                <div className="p-2 bg-red-800 text-white rounded">
                  <FaShoppingCart className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Delivered */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">TOTAL DELIVERED</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.delivered}</h2>
                <div className="p-2 bg-red-800 text-white rounded">
                  <FaShoppingCart className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Customer Card */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-3">
              <p className="text-xs text-gray-500">TOTAL CUSTOMER</p>
              <div className="flex justify-between items-center mt-2">
                <h2 className="text-lg font-bold text-gray-800">{summaryData.totalCustomers}</h2>
                <div className="p-2 bg-red-800 text-white rounded">
                  <FaUsers className="text-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary with Chart - With shadow */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-lg">
            <div className="mb-3">
              <p className="text-xs text-gray-500">ORDERS</p>
              <h4 className="font-medium text-gray-800">Order Summary</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="border border-red-800 rounded-lg p-2 text-center">
                <h5 className="text-gray-500 text-xs">TOTAL</h5>
                <p className="text-lg font-bold text-gray-800">{orderSummary.totalOrder}</p>
              </div>
              <div className="border border-red-800 rounded-lg p-2 text-center">
                <h5 className="text-gray-500 text-xs">ON DELIVERY</h5>
                <p className="text-lg font-bold text-gray-800">{orderSummary.onDelivery}</p>
              </div>
              <div className="border border-red-800 rounded-lg p-2 text-center">
                <h5 className="text-gray-500 text-xs">DELIVERED</h5>
                <p className="text-lg font-bold text-gray-800">{orderSummary.delivered}</p>
              </div>
            </div>
            
            {/* Donut chart with thicker stroke */}
            <div className="flex justify-center items-center h-44">
              <div className="flex items-center">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f1f1" strokeWidth="30" />
                  
                  {/* Red segment (Total Order) - 50% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#cb2027"
                    strokeWidth="30"
                    strokeDasharray="188.5 377"
                    strokeDashoffset="0"
                  />
                  
                  {/* Blue segment (On Delivery) - 17% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#3498db"
                    strokeWidth="30"
                    strokeDasharray="64.09 377"
                    strokeDashoffset="-188.5"
                  />
                  
                  {/* Green segment (Delivered) - 33% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#2ecc71"
                    strokeWidth="30"
                    strokeDasharray="124.41 377"
                    strokeDashoffset="-252.59"
                  />
                  
                  {/* Center white circle */}
                  <circle cx="80" cy="80" r="30" fill="white" />
                </svg>
                <div className="ml-4">
                  {/* Legend for the chart */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                      <p className="text-xs">Total: {orderSummary.totalOrder}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <p className="text-xs">On Delivery: {orderSummary.onDelivery}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <p className="text-xs">Delivered: {orderSummary.delivered}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Chart - With shadow */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="mb-3">
              <p className="text-xs text-gray-500">PERFORMANCE</p>
              <h4 className="font-medium text-gray-800">Total orders</h4>
            </div>
            
            {/* Thicker Bar chart */}
            <div className="h-44 flex items-end justify-between px-2 pt-4">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-red-800 w-6 rounded-t-sm"
                    style={{ height: `${item.value * 2}px` }}
                  ></div>
                  <p className="text-xs mt-2">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders - Improved styling with box and shadow */}
        <div className="mt-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 ">
            <h3 className="font-bold text-gray-800">Recent Order</h3>
            <a href="/admin/orders" className="text-white bg-red-800 px-3 py-1 rounded text-xs font-bold">SEE ALL</a>
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
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-200 text-center">
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

export default AdminDashboard;