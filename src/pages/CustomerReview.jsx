import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';

const CustomerReview = () => {
  const navigate = useNavigate();
  const [unratedOrders, setUnratedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Rating state for each order
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  const apiUrl = 'http://kebabmutiara.xyz/api';
  
  const fetchUnratedOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/ulasan`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setUnratedOrders(response.data.data);
        
        // Initialize ratings and comments for each order
        const initialRatings = {};
        const initialComments = {};
        response.data.data.forEach(order => {
          initialRatings[order.id] = 0;
          initialComments[order.id] = '';
        });
        
        setRatings(initialRatings);
        setComments(initialComments);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching unrated orders:', err);
      setError('Failed to load orders for review. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      navigate('/');
      return;
    }
    
    fetchUnratedOrders();
  }, [navigate]);

  // Handle star rating click
  const handleRatingChange = (orderId, rating) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [orderId]: rating
    }));
  };

  // Handle comment input change
  const handleCommentChange = (orderId, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [orderId]: comment
    }));
  };

  // Submit review
  const handleSubmitReview = async (orderId) => {
    if (ratings[orderId] === 0) {
      setError('Please select a rating before submitting');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/ulasan/${orderId}`,
        {
          rating: ratings[orderId],
          comment: comments[orderId]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove the reviewed order from the list
      setUnratedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      // Show success message
      setSuccessMessage('Review submitted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get user information from localStorage
  const customerName = localStorage.getItem('userName') || 'Customer';

  // Render rating stars
  const renderStars = (orderId) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`cursor-pointer ${i <= ratings[orderId] ? 'text-yellow-500' : 'text-gray-300'}`}
          size={24}
          onClick={() => handleRatingChange(orderId, i)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex min-h-screen bg-red-900">
      {/* Background pattern */}
      <div
        className="absolute top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Sidebar */}
      <CustomerSidebar activePage="review" />

      {/* Main Content - With proper margin to accommodate fixed sidebar */}
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        {/* Header with Title and User */}
        <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-6">
          <h1 className="text-red-800 font-bold">Product Reviews</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUserAlt className="mr-2 text-xs" />
            <span className="text-xs">{customerName}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
              <p className="mt-2 text-gray-600">Loading your orders...</p>
            </div>
          ) : unratedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You don't have any orders to review at the moment.
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-red-800">Orders Awaiting Your Review</h2>
              
              {unratedOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="border border-red-800 rounded-lg p-4 mb-4"
                >
                  <div className="mb-4">
                    <h3 className="font-bold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {/* Order Items */}
                  <div className="mb-4">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="w-12 h-12 mr-3">
                          <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.gambar || '/api/placeholder/100/100'}
                              alt={item.nama}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/api/placeholder/100/100'; }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.nama}</p>
                          <p className="text-sm text-gray-600">
                            {item.jumlah || 1} x Rp. {item.harga?.toLocaleString('id-ID') || '0'}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {(!order.items || order.items.length === 0) && (
                      <p className="text-gray-500 italic">No items data available</p>
                    )}
                  </div>
                  
                  {/* Rating Section */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-gray-600 text-sm mb-2">Your Rating</label>
                      <div className="flex space-x-2">
                        {renderStars(order.id)}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-600 text-sm mb-2">Your Comment (Optional)</label>
                      <textarea
                        value={comments[order.id]}
                        onChange={(e) => handleCommentChange(order.id, e.target.value)}
                        className="w-full border border-red-800 rounded-lg p-3 h-24"
                        placeholder="Share your experience with this order..."
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSubmitReview(order.id)}
                        disabled={submitting || ratings[order.id] === 0}
                        className={`bg-red-800 text-white px-6 py-2 rounded-md ${
                          submitting || ratings[order.id] === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;