import React, { useState, useEffect } from 'react';
import { FaUsers, FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';
import axios from 'axios';

const API_BASE_URL = 'http://kebabmutiara.xyz/api/allulasan';

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(15);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        const response = await axios.get(API_BASE_URL, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        console.log('API response:', response.data);

        const data = response.data;

        let allReviews = [];
        let counter = 1;

        // Check the structure of the response data
        data.forEach((item) => {
          console.log('Item:', item);

          if (item.rating_value && item.comment) {
            allReviews.push({
              no: counter++,
              rating_id: item.rating_id,
              keranjang_id: item.id_keranjang,
              buyer_name: item.name || 'Unknown', // Nama pembeli
              product_name: item.nama_produk || 'Unknown Product', // Nama produk
              rating: Number(item.rating_value) || 0,
              review: item.comment || '',
              created_at: item.created_at || '',
              appearance: true,  // Default appearance value
            });
          }
        });

        console.log('Filtered reviews:', allReviews);

        if (allReviews.length === 0) {
          setError('No reviews found.');
        } else {
          setError(null);
        }

        setReviews(allReviews);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load reviews.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Toggle appearance of a specific review based on keranjang_id
  const toggleAppearance = (keranjang_id) => {
    setReviews((prev) =>
      prev.map((rev) =>
        rev.keranjang_id === keranjang_id
          ? { ...rev, appearance: !rev.appearance } // Toggle only the clicked review's appearance
          : rev // Keep the other reviews unchanged
      )
    );
  };

  const renderStars = (rating) => '★'.repeat(rating);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
        <span className="ml-4 text-red-800">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <AdminSidebar activePage="review" />

      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Ulasan</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Semua Ulasan</h3>
            <div>
              {error && <span className="text-red-500 text-xs mr-4">{error}</span>}
              <button
                onClick={() => window.location.reload()}
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
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-red-800 text-white text-center">
                      <th className="py-2 px-3 text-xs w-12">NO</th>
                      <th className="py-2 px-3 text-xs w-1/6">NAMA PEMBELI</th>
                      <th className="py-2 px-3 text-xs w-1/6">MENU</th>
                      <th className="py-2 px-3 text-xs w-20">PENILAIAN</th>
                      <th className="py-2 px-3 text-xs">ULASAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          No reviews found.
                        </td>
                      </tr>
                    ) : (
                      currentReviews.map((review) => (
                        <tr
                          key={review.rating_id || review.keranjang_id}
                          className="border-b border-gray-200 text-center hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2 px-3 text-xs w-12">{indexOfFirstReview + review.no}</td>
                          <td className="py-2 px-3 text-xs text-red-800 font-medium w-1/6">{review.buyer_name}</td>
                          <td className="py-2 px-3 text-xs text-gray-700 w-1/6">{review.product_name}</td>
                          <td className="py-2 px-3 text-xs text-yellow-500 w-20">{renderStars(review.rating)}</td>
                          <td className="py-2 px-3 text-xs text-left text-red-800 break-words">{review.review}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {reviews.length > 0 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Menampilkan {indexOfFirstReview + 1} - {Math.min(indexOfLastReview, reviews.length)} dari {reviews.length} ulasan
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-800 text-white hover:bg-red-900'
                      } transition`}
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    
                    <span className="px-3 py-1 bg-red-800 text-white rounded-md text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-800 text-white hover:bg-red-900'
                      } transition`}
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReview;