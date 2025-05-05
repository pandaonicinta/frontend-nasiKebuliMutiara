import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';

const CustomerReview = () => {
  const navigate = useNavigate();
  const customerName = localStorage.getItem('userName') || 'Customer';

  // Check if user is logged in as customer
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'customer') {
      navigate('/');
    }
  }, [navigate]);

  // Review history data
  const orders = [
    {
      id: 1,
      date: '1 January 2025',
      status: 'Completed',
      items: [
        {
          name: 'Nasi Kebuli Kambing',
          size: 'L',
          price: 'Rp. 55.000',
          image: '/api/placeholder/100/100'
        }
      ]
    },
    {
      id: 2,
      date: '1 January 2025',
      status: 'Completed',
      items: [
        {
          name: 'Nasi Kebuli Kambing',
          size: 'L',
          price: 'Rp. 55.000',
          image: '/api/placeholder/100/100'
        }
      ]
    },
    {
      id: 3,
      date: '1 January 2025',
      status: 'Completed',
      items: [
        {
          name: 'Nasi Kebuli Kambing',
          size: 'L',
          price: 'Rp. 55.000',
          image: '/api/placeholder/100/100'
        }
      ]
    }
  ];

  const handleWriteReview = (orderId) => {
    navigate(`/customer/review/${orderId}`);
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
      <CustomerSidebar activePage="review" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-6">
        {/* Header with Page Title and Customer badge */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Review</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Review Heading */}
          <div className="p-4">
            <h2 className="text-base font-bold text-gray-800">My Review</h2>
          </div>

          {/* Red divider line */}
          <div className="h-0.5 bg-red-800"></div>

          {/* Review List Table Header */}
          <div className="flex bg-red-800 text-white p-3 text-sm">
            <div className="w-16 text-center">NO</div>
            <div className="flex-1">ORDER</div>
          </div>

          {/* Orders List */}
          {orders.map((order, index) => (
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
                        <span className="text-sm font-bold">{order.status}</span>
                        <span className="text-xs text-gray-500 ml-2">Enjoy your meal</span>
                      </div>
                      <span className="text-xs">{order.date}</span>
                    </div>
                    
                    {/* Divider between status and order items */}
                    <div className="w-full h-px bg-gray-300 my-3"></div>

                    
                     {/* Order Items */}
                     {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="w-full flex items-center mt-2">
                        <div className="w-10 mr-3">
                          {/* Empty column for alignment */}
                        </div>
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
                        <div className="w-28 text-right">
                          <button
                            onClick={() => handleWriteReview(order.id)}
                            className="text-xs text-white bg-red-800 px-6 py-1 rounded mt-1 inline-block"
                          >
                            REVIEW
                          </button>
                        </div>
                      </div>
                    ))}
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

export default CustomerReview;