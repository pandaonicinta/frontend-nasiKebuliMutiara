import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartPie, FaUsers, FaShoppingCart } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';
import MapComponent from './Map'
import axios from 'axios'; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState({
    incomeToday: 'Rp. 0',
    totalOrders: 0,
    delivered: 0,
    totalCustomers: 0
  });
  const [orderSummary, setOrderSummary] = useState({
    totalOrder: 0,
    onDelivery: 0,
    delivered: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
      navigate('/');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const formatMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(month) - 1];
  };

  // Generate last 6 months including current month
  const generateLast6Months = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      months.push({
        key: monthKey,
        name: monthNames[date.getMonth()],
        value: 0 // default value
      });
    }
    
    return months;
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch main dashboard data
      const summaryResponse = await axios.get('http://kebabmutiara.xyz/api/dashboard', { headers });
      
      const formattedIncome = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(summaryResponse.data.income_money);
      
      setSummaryData({
        incomeToday: formattedIncome,
        totalOrders: summaryResponse.data.total_order,
        delivered: summaryResponse.data.total_delivered,
        totalCustomers: summaryResponse.data.total_customer
      });
      
      const totalOrder = summaryResponse.data.total_order;
      const delivered = summaryResponse.data.total_delivered;
      const onDelivery = totalOrder - delivered;
      
      setOrderSummary({
        totalOrder,
        onDelivery,
        delivered
      });
      
      // Get recent orders
      const ordersResponse = await axios.get('http://kebabmutiara.xyz/api/dashboard/order', { headers });
      const formattedOrders = ordersResponse.data.slice(0, 5).map(order => ({
        id: order.transaksi_id,
        date: order.tanggal_pembelian,
        customerName: order.nama_pembeli,
        amount: new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(order.total_harga),
        status: order.status.toUpperCase()
      }));
      
      setRecentOrders(formattedOrders);

      // Fetch performance chart data
      const performanceResponse = await axios.get('http://kebabmutiara.xyz/api/dashboard/report', { headers });
      
      // Generate last 6 months template
      const last6Months = generateLast6Months();
      
      // Map API data to the 6 months template
      const apiDataMap = {};
      performanceResponse.data.forEach(item => {
        apiDataMap[item.month] = parseInt(item.total_orders);
      });
      
      // Fill the template with actual data where available
      const finalPerformanceData = last6Months.map(month => ({
        name: month.name,
        value: apiDataMap[month.key] || 0
      }));
      
      setPerformanceData(finalPerformanceData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set last 6 months with zero values if API fails
      const last6Months = generateLast6Months();
      setPerformanceData(last6Months.map(month => ({
        name: month.name,
        value: 0
      })));
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
      case 'ON DELIVERY':
      case 'OTW':
        return 'bg-blue-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      case 'NEW ORDER':
      case 'PROCESSING':
        return 'bg-red-500 text-white text-xs px-1 py-1 rounded-md w-24 inline-block';
      default:
        return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md w-24 inline-block';
    }
  };

  const calculateChartData = () => {
    const total = orderSummary.totalOrder;
    if (total === 0) return { totalPercent: 0, onDeliveryPercent: 0, deliveredPercent: 0 };
    
    const deliveredPercent = (orderSummary.delivered / total) * 100;
    const onDeliveryPercent = (orderSummary.onDelivery / total) * 100;
    const totalPercent = 100 - deliveredPercent - onDeliveryPercent;
    
    return {
      totalPercent,
      onDeliveryPercent,
      deliveredPercent
    };
  };

  const chartData = calculateChartData();
  
  const calculateCircleSegments = () => {
    const circumference = 2 * Math.PI * 60; 
    
    const totalDash = (chartData.totalPercent / 100) * circumference;
    const onDeliveryDash = (chartData.onDeliveryPercent / 100) * circumference;
    const deliveredDash = (chartData.deliveredPercent / 100) * circumference;
    
    const totalOffset = 0;
    const onDeliveryOffset = -totalDash;
    const deliveredOffset = -(totalDash + onDeliveryDash);
    
    return {
      totalDash: `${totalDash} ${circumference}`,
      onDeliveryDash: `${onDeliveryDash} ${circumference}`,
      deliveredDash: `${deliveredDash} ${circumference}`,
      totalOffset,
      onDeliveryOffset,
      deliveredOffset
    };
  };

  const circleSegments = calculateCircleSegments();

  // Calculate max value for bar chart scaling
  const maxValue = Math.max(...performanceData.map(item => item.value), 1);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0" 
          style={{ 
            backgroundImage: `url(${aksen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
      </div>

      <AdminSidebar activePage="dashboard" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Dashboard</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Income Card */}
              <div className="bg-white rounded-lg shadow-lg">
                <div className="p-3">
                  <p className="text-xs text-gray-500">UANG PENDAPATAN</p>
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
                  <p className="text-xs text-gray-500">TOTAL PESANAN</p>
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
                  <p className="text-xs text-gray-500">PESANAN SELESAI</p>
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
                  <p className="text-xs text-gray-500">TOTAL PEMBELI</p>
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
              {/* Order Summary */}
              <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-lg">
                <div className="mb-3">
                  <p className="text-xs text-gray-500">PESANAN</p>
                  <h4 className="font-medium text-gray-800">Ringkasan Pesanan</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="border border-red-800 rounded-lg p-2 text-center">
                    <h5 className="text-gray-500 text-xs">TOTAL</h5>
                    <p className="text-lg font-bold text-gray-800">{orderSummary.totalOrder}</p>
                  </div>
                  <div className="border border-red-800 rounded-lg p-2 text-center">
                    <h5 className="text-gray-500 text-xs">SEDANG DALAM PROSES</h5>
                    <p className="text-lg font-bold text-gray-800">{orderSummary.onDelivery}</p>
                  </div>
                  <div className="border border-red-800 rounded-lg p-2 text-center">
                    <h5 className="text-gray-500 text-xs">SELESAI</h5>
                    <p className="text-lg font-bold text-gray-800">{orderSummary.delivered}</p>
                  </div>
                </div>
                
                {/* Donut chart */}
                <div className="flex justify-center items-center h-44">
                  <div className="flex items-center">
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f1f1" strokeWidth="30" />
                      
                      {/* Total Order */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#cb2027"
                        strokeWidth="30"
                        strokeDasharray={circleSegments.totalDash}
                        strokeDashoffset={circleSegments.totalOffset}
                      />
                      
                      {/* On Delivery */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#3498db"
                        strokeWidth="30"
                        strokeDasharray={circleSegments.onDeliveryDash}
                        strokeDashoffset={circleSegments.onDeliveryOffset}
                      />
                      
                      {/* Delivered */}
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#2ecc71"
                        strokeWidth="30"
                        strokeDasharray={circleSegments.deliveredDash}
                        strokeDashoffset={circleSegments.deliveredOffset}
                      />
                      
                      <circle cx="80" cy="80" r="30" fill="white" />
                    </svg>
                    <div className="ml-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                          <p className="text-xs">Total: {orderSummary.totalOrder}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <p className="text-xs">Sedang Diantar: {orderSummary.onDelivery}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <p className="text-xs">Selesai: {orderSummary.delivered}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="mb-3">
                  <p className="text-xs text-gray-500">PERFORMA</p>
                  <h4 className="font-medium text-gray-800">Total Pesanan</h4>
                </div>
                
                {/* Bar chart */}
                <div className="h-44 flex items-end justify-between px-2 pt-4">
                  {performanceData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-red-800 w-6 rounded-t-sm"
                        style={{ 
                          height: `${maxValue > 0 ? (item.value / maxValue) * 120 : 0}px`,
                          minHeight: item.value > 0 ? '4px' : '0px'
                        }}
                      ></div>
                      <p className="text-xs mt-2">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 ">
                <MapComponent />
              </div>
            </div>
            {/* Recent Orders */}
            <div className="mt-6 bg-white rounded-lg shadow-lg">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 ">
                <h3 className="font-bold text-gray-800">Pesanan Terbaru</h3>
                <a href="/admin/orders" className="text-white bg-red-800 px-3 py-1 rounded text-xs font-bold">LIHAT SEMUA</a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-red-800 text-white text-center">
                      <th className="py-2 px-3 text-xs">ID PESANAN</th>
                      <th className="py-2 px-3 text-xs">TANGGAL</th>
                      <th className="py-2 px-3 text-xs">NAMA PEMBELI</th>
                      <th className="py-2 px-3 text-xs">JUMLAH</th>
                      <th className="py-2 px-3 text-xs">STATUS PESANAN</th>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;