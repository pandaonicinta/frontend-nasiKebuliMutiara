import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import aksen from '../assets/images/aksen.png';
import CustomerSidebar from './CustomerSidebar';
import { FaStar } from 'react-icons/fa';

const API_BASE_URL = 'http://kebabmutiara.xyz/api';

const CustomerReviewDetail = () => {
  const navigate = useNavigate();
  const { keranjangId } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchItemReview = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        // Fetch keranjang detail with review info by keranjangId
        const res = await axios.get(`${API_BASE_URL}/keranjang/${keranjangId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data.data || res.data;

        setItem(data);

        if (data.rating && data.rating.rating_value) {
          setHasReviewed(true);
          setRatingValue(data.rating.rating_value);
          setComment(data.rating.comment || '');
        } else {
          setHasReviewed(false);
          setRatingValue(0);
          setComment('');
        }
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load review detail.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemReview();
  }, [keranjangId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ratingValue < 1) {
      alert('Please provide a rating.');
      return;
    }
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/ulasan/${keranjangId}`, {
        rating_value: ratingValue,
        comment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Review submitted successfully!');
      setHasReviewed(true);
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{ backgroundImage: `url(${aksen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <CustomerSidebar activePage="review" />
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6 flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
          <p className="mt-2 text-gray-600">Loading review detail...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{ backgroundImage: `url(${aksen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <CustomerSidebar activePage="review" />
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-red-800 text-white px-4 py-2 rounded text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{ backgroundImage: `url(${aksen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <CustomerSidebar activePage="review" />
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-red-800 mb-4">{item?.nama_produk || 'Product Review'}</h2>
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 mr-4">
              <img
                src={item?.gambar ? `${API_BASE_URL.replace('/api', '')}/storage/${item.gambar}` : defaultImage}
                alt={item?.nama_produk}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Jika sudah review, tampilkan rating dan comment read-only */}
            {hasReviewed ? (
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`mr-1 ${i < ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment || '-'}</p>
              </div>
            ) : (
              // Jika belum review, tampilkan form input
              <form onSubmit={handleSubmit} className="flex-1">
                <label className="block mb-2 font-semibold text-gray-700">Rate this product</label>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      onClick={() => setRatingValue(i + 1)}
                      className={`cursor-pointer mr-1 ${i < ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                      size={24}
                    />
                  ))}
                </div>

                <label className="block mb-2 font-semibold text-gray-700">Comment</label>
                <textarea
                  className="w-full border border-gray-300 rounded p-2 mb-4"
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review here..."
                  required
                />

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-red-800 text-white px-6 py-2 rounded hover:bg-red-900 transition disabled:opacity-50"
                >
                  {submitLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewDetail;
