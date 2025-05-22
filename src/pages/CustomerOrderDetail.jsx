import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUser } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import aksen from '../assets/images/aksen.png';
import CustomerSidebar from './CustomerSidebar';
import defaultImage from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz';

const CustomerOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const customerName = localStorage.getItem('userName') || 'Customer';

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const response = await axios.get(`${API_BASE_URL}/api/transaksi/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let order = response.data.data || response.data;

        order.keranjang = Array.isArray(order.keranjang) ? order.keranjang : [];
        order.keranjang = order.keranjang.map((item) => ({
          keranjang_id: item.keranjang_id,
          nama_produk:
            item.nama_produk ||
            item.produk?.nama_produk ||
            item.produk?.nama ||
            'Unknown',
          ukuran: item.ukuran || item.produk?.ukuran || '-',
          quantity: Number(item.quantity || item.jumlah) || 1,
          harga: Number(item.harga || item.produk?.harga) || 0,
          gambar:
            item.gambar ||
            (item.produk?.gambar
              ? `${API_BASE_URL}/storage/${item.produk.gambar}`
              : null),
        }));

        const subtotal = order.keranjang.reduce(
          (sum, i) => sum + i.harga * i.quantity,
          0
        );
        const deliveryFee = 10000;

        order.subtotal = subtotal;
        order.deliveryFee = deliveryFee;
        order.total = subtotal + deliveryFee;

        setOrderDetails(order);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order detail:', err);
        setError('Failed to load order details. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}/storage/${path}`;
  };

  const getOrderDate = () => {
    if (!orderDetails) return null;
    return (
      orderDetails.created_at ||
      orderDetails.tanggal ||
      orderDetails.tanggal_pembelian ||
      null
    );
  };

  // Format tanggal dengan format "22-Mei-2025 21:45"
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';

    const day = date.getDate();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const formatStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'on deliver':
      case 'on delivery':
      case 'otw':
        return 'bg-blue-500';
      case 'on process':
      case 'cooking':
      case 'masak':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-500';
      case 'success':
        return 'bg-blue-400';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatStatusText = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'on deliver':
      case 'on delivery':
      case 'otw':
        return 'ON DELIVERY';
      case 'on process':
      case 'cooking':
      case 'masak':
        return 'COOKING';
      default:
        return status.toUpperCase();
    }
  };

  const handleBack = () => {
    navigate('/customer');
  };

  const handleReorder = () => {
    if (!orderDetails) return;
    try {
      localStorage.setItem('cartItems', JSON.stringify(orderDetails.keranjang));
      navigate('/menu');
    } catch {
      alert('Failed to add items to cart');
    }
  };

  if (loading)
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
        <CustomerSidebar activePage="order" />
        <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6 flex items-center justify-center">
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );

  if (error)
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
        <CustomerSidebar activePage="order" />
        <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="text-lg text-red-600">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs"
            >
              <FaArrowLeft className="mr-2 text-xs" /> BACK
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Background */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <CustomerSidebar activePage="order" />
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-base font-bold text-red-800">Order Detail</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUser className="mr-2 text-xs" />
            <span className="text-xs font-medium">{customerName}</span>
          </div>
        </div>

        {/* Kotak Putih utama */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 p-4">
          {/* Baris tombol Kembali dan kotak status berjajar, status lebar penuh sisa */}
          <div className="flex items-center mb-6 space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center px-4 py-2 bg-red-800 text-white rounded-lg text-xs h-10 flex-shrink-0"
            >
              <FaArrowLeft className="mr-2 text-xs" /> KEMBALI
            </button>

            <div className="flex-grow border-2 border-red-800 rounded-lg h-10 px-4 text-xs flex justify-between items-center">
              <span className="font-semibold text-sm whitespace-nowrap">Order Status</span>
              <span
                className={`${formatStatusClass(
                  orderDetails.status
                )} text-white px-3 py-1 rounded`}
              >
                {formatStatusText(orderDetails.status)}
              </span>
            </div>
          </div>

          {/* Detail Isi Pesanan */}
          <div className="flex flex-wrap gap-6">
            {/* Detail summary */}
            <div className="w-full md:w-3/5 flex-1">
              <div className="bg-white p-3 rounded-lg border-2 border-red-800">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Details</h3>
                <div className="border-2 border-red-800 rounded-lg p-3">
                  {/* Order Summary */}
                  <div className="mb-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">Order id</span>
                      <span className="text-xs font-bold text-gray-700">#{orderDetails.transaksi_id}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">Date</span>
                      <span className="text-xs font-bold text-gray-700">{formatDate(getOrderDate())}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700">Item</span>
                      <span className="text-xs font-bold text-gray-700">{orderDetails.keranjang.length}</span>
                    </div>
                  </div>

                  <div className="w-full border-t border-gray-200 my-2"></div>

                  {/* Items List */}
                  {orderDetails.keranjang.length > 0 ? (
                    orderDetails.keranjang.map((item, index) => (
                      <div
                        key={index}
                        className="flex py-2 border-b border-gray-200 last:border-b-0 items-center"
                      >
                        <div className="w-12 h-12 mr-3 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                          <img
                            src={getImageUrl(item.gambar)}
                            alt={item.nama_produk}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = defaultImage;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold">{item.nama_produk}</h4>
                          <p className="text-xs text-gray-500">Size: {item.ukuran}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500">{item.quantity}x</span>
                          <span className="text-xs font-bold">
                            Rp. {(Number(item.harga) || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">No items in this order</p>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="mt-3">
                    <h4 className="text-xs font-bold mb-2">Payment</h4>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Subtotal</span>
                      <span>
                        Rp. {(Number(orderDetails.subtotal) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Delivery Fee</span>
                      <span>
                        Rp. {(Number(orderDetails.deliveryFee) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm">
                      <span>Total</span>
                      <span>Rp. {(Number(orderDetails.total) || 0).toLocaleString('id-ID')}</span>
                    </div>

                    {/* Reorder button */}
                    {['delivered', 'success', 'completed'].includes(
                      (orderDetails.status || '').toLowerCase()
                    ) && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={handleReorder}
                          className="bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-medium w-full"
                        >
                          REORDER
                        </button>
                      </div>
                    )}

                    {/* Temporary order warning */}
                    {id.startsWith('temp-') && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 text-center">
                          This is a temporary order. Please wait for confirmation from
                          the restaurant.
                        </p>
                      </div>
                    )}
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

export default CustomerOrderDetail;
