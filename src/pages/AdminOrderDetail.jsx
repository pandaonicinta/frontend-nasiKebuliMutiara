import React from 'react';
import { FaUsers, FaArrowLeft, FaHome, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminOrderDetail = () => {
  const navigate = useNavigate();

  // Order details data
  const orderDetails = {
    id: '#123123',
    date: '1 January 2025, 12.00',
    status: 'DELIVERED',
    items: [
      {
        name: 'Nasi Kebuli Kambing',
        size: 'L',
        quantity: 1,
        price: 'Rp. 55.000',
        image: '/api/placeholder/100/100'
      }
    ],
    subtotal: 'Rp. 55.000',
    deliveryFee: 'Rp. 10.000',
    total: 'Rp. 65.000',
    driver: {
      name: 'Driver',
      phone: '0812 1234 1234',
      deliveryTime: '12:00'
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'ON DELIVERY':
        return 'bg-blue-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      case 'NEW ORDER':
        return 'bg-red-500 text-white text-xs px-4 py-1 rounded-md inline-block';
      default:
        return 'bg-gray-500 text-white text-xs px-4 py-1 rounded-md inline-block';
    }
  };

  const handleBack = () => {
    navigate('/admin/orders');
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
      <AdminSidebar activePage="order" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        {/* Header with Order Detail and Admin in a box */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Order Detail</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-xs" />
            <span className="text-xs font-medium">Admin</span>
          </div>
        </div>

        {/* Main container - Order section and content below */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Order Heading */}
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">Order</h2>
          </div>
          
          {/* Red divider line - thinner */}
          <div className="h-4 bg-red-800"></div>
          
          {/* Content section - white background continuous with Order section */}
          <div className="p-4">
            {/* Back Button and Order Status */}
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
                  {orderDetails.status}
                </span>
              </div>
            </div>

            {/* Order Details and Tracking */}
            <div className="flex flex-wrap gap-6">
              {/* Left column - Tracking */}
              <div className="w-1/3">
                <div className="bg-white p-3 rounded-lg border-2 border-red-800">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Tracking Order</h3>
                  
                  {/* Map placeholder with border */}
                  <div className="border-2 border-red-800 rounded-lg overflow-hidden mb-3">
                    <div className="w-full h-48 bg-gray-100 relative">
                      {/* Restaurant marker */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                            <FaHome className="text-white" />
                          </div>
                          <div className="mt-1 text-red-800 font-bold text-xs">Kebuli Mutiara</div>
                        </div>
                      </div>
                      
                      {/* Customer marker */}
                      <div className="absolute bottom-8 left-1/4">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-md">
                          <FaUser className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver info */}
                  <div className="border-2 border-red-800 rounded-lg p-3 mb-3 flex items-center justify-center">
                    <div className="text-red-800 mr-2">
                      <FaUser className="text-lg" />
                    </div>
                    <span className="text-sm font-bold">{orderDetails.driver.name}</span>
                  </div>
                  
                  {/* Driver contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border-2 border-red-800 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Driver Phone</p>
                      <p className="text-xs">{orderDetails.driver.phone}</p>
                    </div>
                    <div className="border-2 border-red-800 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Delivery Time</p>
                      <p className="text-xs">{orderDetails.driver.deliveryTime}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Order Details */}
              <div className="flex-1">
                <div className="bg-white p-3 rounded-lg border-2 border-red-800">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Details</h3>
                  
                  <div className="border-2 border-red-800 rounded-lg p-3">
                    {/* Order details */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Order id</span>
                        <span className="text-xs font-bold">{orderDetails.id}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Date</span>
                        <span className="text-xs font-bold">{orderDetails.date}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-700">Item</span>
                        <span className="text-xs font-bold">1</span>
                      </div>
                    </div>
                    <div className="w-full border-t border-gray-200 mt-2"></div>
                    
                    {/* Order Items */}
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex py-2 border-b border-gray-200">
                        <div className="w-12 h-12 mr-3">
                          <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                            <img 
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold">{item.name}</h4>
                          <p className="text-xs text-gray-500">Size: {item.size}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs">{item.quantity}</span>
                          <span className="text-xs font-bold">{item.price}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Payment Summary */}
                    <div className="mt-3">
                      <h4 className="text-xs font-bold mb-2">Payment</h4>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">Subtotal</span>
                        <span className="text-xs font-bold">{orderDetails.subtotal}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">Delivery Fee</span>
                        <span className="text-xs font-bold">{orderDetails.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray">
                        <span className="text-xs text-gray-700">Total</span>
                        <span className="text-xs font-bold">{orderDetails.total}</span>
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