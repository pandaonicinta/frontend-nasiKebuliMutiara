import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaStar } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';

const CustomerReviewDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const customerName = localStorage.getItem('userName') || 'Customer';
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // Check if user is logged in as customer
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'customer') {
      navigate('/');
    }
  }, [navigate]);

  // Order data (would fetch from API in a real app)
  const orderData = {
    id: orderId,
    date: '1 January 2025',
    product: {
      name: 'Nasi Kebuli Kambing',
      size: 'L',
      image: '/api/placeholder/100/100'
    }
  };

  const handleStarClick = (index) => {
    setRating(index);
  };

  const handleSubmitReview = () => {
    // Here you would send the review to your backend
    console.log('Submitting review:', { orderId, rating, review });
    // Navigate back to review list
    navigate('/customer/review');
  };

  const handleBack = () => {
    navigate('/customer/review');
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

        {/* Review Form - Simplified layout to match design */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Product Section - Simple without box shadow */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold">PRODUCT</h3>
              <span className="text-xs text-gray-500">{orderData.date}</span>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden mr-4">
                <img
                  src={orderData.product.image}
                  alt={orderData.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold">{orderData.product.name}</h4>
                <p className="text-xs text-gray-500">Size: {orderData.product.size}</p>
              </div>
            </div>
          </div>

          {/* Rating and Review Section with red border */}
          <div className="mx-6 mb-6 border-2 border-red-800 rounded-lg p-4">
            {/* Rating Section */}
            <div className="mb-4">
              <h3 className="text-sm mb-2">Rate Product Quality</h3>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-3xl mr-1 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    onClick={() => handleStarClick(star)}
                  />
                ))}
              </div>
            </div>
            
            {/* Divider between rating and review */}
            <div className="border-t border-gray-300 my-4"></div>

            {/* Review Text Section */}
            <div>
              <h3 className="text-sm mb-2">Write your opinion about us</h3>
              <p className="text-xs text-gray-500 mb-2">Share your opinion about your shopping experience on our application here</p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-1 focus:ring-red-800"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review here..."
              ></textarea>
            </div>
          </div>

          {/* Action Buttons - Styled to match design */}
          <div className="px-6 pb-6 flex justify-end space-x-4">
            <button
              onClick={handleBack}
              className="px-8 py-2 border border-red-800 text-red-800 rounded-lg text-sm font-medium"
            >
              BACK
            </button>
            <button
              onClick={handleSubmitReview}
              className="px-8 py-2 bg-red-800 text-white rounded-lg text-sm font-medium"
            >
              REVIEW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewDetail;