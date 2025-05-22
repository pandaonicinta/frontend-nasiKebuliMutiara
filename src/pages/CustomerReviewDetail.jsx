import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaUser, FaStar, FaArrowLeft } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';
import axios from 'axios';
import defaultImage from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz/api';

const CustomerReviewDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const customerName = localStorage.getItem('userName') || 'Customer';

  const productFromState = location.state?.product || null;
  const viewOnly = location.state?.viewOnly || false;

  const [product, setProduct] = useState(productFromState);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(!productFromState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!productFromState) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Authentication token not found');

          const res = await axios.get(`${API_BASE_URL}/ulasan/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data) {
            setProduct(res.data.product || res.data);
            if (res.data.rating) {
              setRating(Number(res.data.rating.rating_value || 5));
              setComment(res.data.rating.comment || '');
            } else {
              setRating(5);
              setComment('');
            }
          } else {
            setError('Data product tidak ditemukan');
          }
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Gagal memuat data produk');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    } else {
      if (productFromState.rating !== null && productFromState.rating !== undefined) {
        setRating(Number(productFromState.rating));
        setComment(productFromState.comment || '');
      }
    }
  }, [orderId, productFromState]);

  const handleStarClick = (index) => {
    if (!viewOnly) setRating(index);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      await axios.post(
        `${API_BASE_URL}/ulasan/${orderId}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMsg('Review submitted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);

      navigate('/customer/review', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => navigate('/customer/review');

  const insetShadowStyle = {
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">Product data not found.</p>
        <button
          onClick={handleBack}
          className="ml-4 bg-red-800 text-white px-4 py-2 rounded"
        >
          KEMBALI
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{ backgroundImage: `url(${aksen})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <CustomerSidebar activePage="review" />

      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Ulasan</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs h-10 flex-shrink-0 mb-6"
          >
            <FaArrowLeft className="mr-2 text-xs" /> KEMBALI
          </button>
          <div className="border-2 border-red-800 rounded-lg p-4 mb-6" style={insetShadowStyle}>
            <h3 className="text-sm font-bold mb-4 border-b border-gray-200 pb-2">Detail Pesanan</h3>
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden mr-6">
                <img
                  src={product.gambar || defaultImage}
                  alt={product.nama_produk || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = defaultImage; }}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold">{product.nama || '-'}</h4>
                {/* <h1 className="text-lg font-bold">{product}</h1> */}
                <p className="text-sm text-gray-500">Ukuran: {product.ukuran || '-'}</p>
                <p className="text-sm text-gray-500">Jumlah: {product.jumlah ?? '-'}</p>
                <p className="text-sm text-gray-700 font-semibold">
                  Harga: Rp. {(product.harga ?? 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
          <div className="border-2 border-red-800 rounded-lg p-4" style={insetShadowStyle}>
            <h3 className="text-sm font-bold mb-4">Nilai Kualitas Menu</h3>
            <div className="flex mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <FaStar
                  key={star}
                  className={`text-3xl mr-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'} ${viewOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={() => handleStarClick(star)}
                />
              ))}
            </div>
            <div className="border-t border-gray-300 mb-6"></div>
            <h3 className="text-sm font-bold mb-2">Penilaian Anda</h3>
            {viewOnly ? (
              <p className="whitespace-pre-wrap border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-700 min-h-[128px]">{comment || '-'}</p>
            ) : (
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-1 focus:ring-red-800"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tulis penilaian Anda di sini..."
              />
            )}
          </div>
        </div>
        {!viewOnly && (
          <div className="px-6 pb-6 flex justify-end space-x-4 mt-6">
            <button
              onClick={handleBack}
              className="px-8 py-2 border border-red-800 text-red-800 rounded-lg text-sm font-medium"
              disabled={submitting}
            >
              KEMBALI
            </button>
            <button
              onClick={handleSubmitReview}
              className="px-8 py-2 bg-red-800 text-white rounded-lg text-sm font-medium"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'NILAI'}
            </button>
          </div>
        )}
        {error && <div className="px-6 pb-6 text-red-600 font-semibold">{error}</div>}
        {successMsg && <div className="px-6 pb-6 text-green-600 font-semibold">{successMsg}</div>}
      </div>
    </div>
  );
};

export default CustomerReviewDetail;
