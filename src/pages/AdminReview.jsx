import React, { useState } from 'react';
import { FaUsers, FaCheck } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminReview = () => {
  const [reviews, setReviews] = useState([
    { no: 1, name: 'Ciput', rating: 5, review: 'Enak banget, bumbunya ga pelit. Besok besok bakal beli di sini lagi pasti', appearance: true },
    { no: 2, name: 'Budi', rating: 4, review: 'Gurih, enak, pas sekali dengan selera saya. Bakal jadi langganan nih', appearance: true },
  ]);

  const toggleAppearance = (reviewNo) => {
    setReviews(reviews.map(review =>
      review.no === reviewNo
        ? {...review, appearance: !review.appearance}
        : review
    ));
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating);
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
      <AdminSidebar activePage="review" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Review</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Review Table */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Review</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-red-800 text-white text-center">
                  <th className="py-2 px-3 text-xs">NO</th>
                  <th className="py-2 px-3 text-xs">NAME</th>
                  <th className="py-2 px-3 text-xs">RATE</th>
                  <th className="py-2 px-3 text-xs">REVIEW</th>
                  <th className="py-2 px-3 text-xs">APPEARANCE</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr
                    key={review.no}
                    className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3 text-xs">{review.no}</td>
                    <td className="py-2 px-3 text-xs text-red-800">{review.name}</td>
                    <td className="py-2 px-3 text-xs text-yellow-500">{renderStars(review.rating)}</td>
                    <td className="py-2 px-3 text-xs text-left text-red-800">{review.review}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => toggleAppearance(review.no)}
                        className={`px-4 py-1 rounded-md text-white text-xs ${
                          review.appearance ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      >
                        {review.appearance && <FaCheck className="inline mr-1" />}
                        {review.appearance ? 'YES' : 'NO'}
                      </button>
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

export default AdminReview;