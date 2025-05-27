import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 px-4">
      <h1 className="text-5xl font-bold text-red-900 mb-4 font-serif">Terima Kasih!</h1>
      <p className="text-gray-700 text-center mb-8 max-w-md">
        Kami senang Anda memutuskan untuk membeli nasi kebuli lezat kami.<br />

      </p>
      <button 
        className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg transition flex items-center"
        onClick={() => navigate('/customer')}
      >
        ← Lihat Pesanan
      </button>
    </div>
  );
};

export default ThankYou;
