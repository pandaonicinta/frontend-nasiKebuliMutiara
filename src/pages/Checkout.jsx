  import React, { useContext, useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { FiSearch, FiShoppingBag, FiX } from 'react-icons/fi';
  import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
  import { CartContext } from '../contexts/CartContext';
  import axios from 'axios';
  import logo from '../assets/images/logo.png';
  import foto from '../assets/images/foto.png';

  const API_BASE_URL = 'http://kebabmutiara.xyz/api';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return foto;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://kebabmutiara.xyz/storage/${imagePath}`;
  };

  const AddressSelectionModal = ({ isOpen, onClose, addresses, selectedAddressId, onSelectAddress, onAddNewAddress }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-70"></div>
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
          <div className="flex justify-between p-3 border-b bg-red-800 rounded-t-lg">
            <h3 className="text-base font-semibold text-white">Pilih Alamat Pengiriman</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
              <FiX size={18} />
            </button>
          </div>
          <div className="p-3">
            <button 
              onClick={onAddNewAddress} 
              className="w-full py-2 mb-3 bg-yellow-200 text-black text-sm rounded-md hover:bg-yellow-500 transition flex items-center justify-center shadow-sm"
            >
              + Tambah Alamat Baru
            </button>
            <div className="max-h-72 overflow-y-auto">
              {addresses && addresses.length > 0 ? (
                addresses.map(address => (
                  <div 
                    key={address.alamat_id}
                    className={`p-3 border mb-2 rounded-md cursor-pointer transition-all ${
                      selectedAddressId === address.alamat_id 
                        ? 'border-yellow-400 bg-yellow-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onSelectAddress(address.alamat_id)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') onSelectAddress(address.alamat_id); }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-maroon-700 text-sm font-medium">{address.label_alamat}</div>
                      <div className="text-xs text-gray-400">{address.no_telepon}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {address.detail}, {address.kelurahan}, {address.kecamatan}, {address.kabupaten}, {address.provinsi}
                    </div>
                    {address.isPrimary && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mt-2">
                        Utama
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">Tidak ada alamat tersimpan</p>
              )}
            </div>
          </div>
          <div className="p-3 border-t flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition">Batal</button>
            <button onClick={onClose} className="px-4 py-1.5 bg-yellow-400 text-black text-sm rounded-md hover:bg-yellow-500 shadow-sm transition">Konfirmasi</button>
          </div>
        </div>
      </div>
    );
  };

  const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, calculateTotal, clearCart, cartCount } = useContext(CartContext);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      paymentMethod: ''
    });
    const [formValid, setFormValid] = useState(false);
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);

    useEffect(() => {
      if (!window.snap) {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'SB-Mid-client-KtaQdyRbUTX03deo'); 
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          console.log('Midtrans Snap script loaded');
        };

        script.onerror = () => {
          console.error('Failed to load Midtrans Snap script');
        };
      }
    }, []);

    const subtotal = checkoutItems.reduce((total, item) => 
      total + (parseFloat(item.harga) * item.quantity), 0);
    
    const shippingCost = 10000;
    const total = subtotal + (checkoutItems.length > 0 ? shippingCost : 0);

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }
          const addressResponse = await axios.get(`${API_BASE_URL}/alamat`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (addressResponse.data && Array.isArray(addressResponse.data)) {
            setAddresses(addressResponse.data);
            const primaryAddress = addressResponse.data.find(addr => addr.isPrimary === 1);
            if (primaryAddress) {
              setSelectedAddress(primaryAddress.alamat_id);
            } else if (addressResponse.data.length > 0) {
              setSelectedAddress(addressResponse.data[0].alamat_id);
            }
          }
          const savedCartItemIds = sessionStorage.getItem('selectedCartItemIds');
          if (savedCartItemIds) {
            try {
              const parsedIds = JSON.parse(savedCartItemIds);
              if (Array.isArray(parsedIds)) {
                setSelectedCartItemIds(parsedIds);
              }
            } catch (e) {
              console.error('Error parsing selectedCartItemIds:', e);
            }
          }
          const selectedFromSession = sessionStorage.getItem('checkoutItems');
          let items = [];
          if (selectedFromSession) {
            items = JSON.parse(selectedFromSession);
          } else {
            const cartResponse = await axios.get(`${API_BASE_URL}/keranjang`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (cartResponse.data && Array.isArray(cartResponse.data) && cartResponse.data.length > 0) {
              items = cartResponse.data.map(item => ({
                id: item.id_produk,
                nama: item.nama_produk,
                harga: item.harga,
                quantity: item.jumlah,
                size: item.ukuran,
                image: getImageUrl(item.gambar),
                keranjang_id: item.keranjang_id  
              }));
            }
          }
          setCheckoutItems(items);
          const userData = JSON.parse(localStorage.getItem('user')) || {};
          setFormData(prevData => ({
            ...prevData,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            phoneNumber: userData.phone || ''
          }));
        } catch (error) {
          console.error('Error fetching checkout data:', error);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [navigate, cartItems]);

    useEffect(() => {
      const { firstName, lastName, email, phoneNumber, paymentMethod } = formData;
      const isValid = firstName.trim() !== '' && 
                      lastName.trim() !== '' && 
                      email.trim() !== '' && 
                      phoneNumber.trim() !== '' && 
                      selectedAddress !== '' &&
                      paymentMethod !== '';
      setFormValid(isValid);
    }, [formData, selectedAddress]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSelect = (addressId) => {
      setSelectedAddress(addressId);
    };

    const openAddressModal = () => {
      setIsAddressModalOpen(true);
    };
    
    const closeAddressModal = () => {
      setIsAddressModalOpen(false);
    };
    
    const handleAddNewAddress = () => {
      navigate('/customer/address');
    };
    
    const handlePaymentMethodChange = (method) => {
      setFormData(prev => ({ ...prev, paymentMethod: method }));
    };

    const processMidtransPayment = (snapToken) => {
      if (window.snap && typeof window.snap.pay === 'function') {
        window.snap.pay(snapToken, {
          onSuccess: function(result) {
            handlePaymentSuccess(result.order_id);
          },
          onPending: function() {
            alert('Pembayaran pending, silakan selesaikan pembayaran.');
          },
          onError: function() {
            handlePaymentFailure();
          },
          onClose: function() {
            alert('Anda menutup jendela pembayaran tanpa menyelesaikan transaksi.');
          }
        });
      } else {
        alert('Payment gateway tidak tersedia. Silakan coba lagi nanti.');
        setIsProcessing(false);
      }
    };

    const handlePaymentSuccess = async (transactionId) => {
      try {
        const token = localStorage.getItem('token');
        await axios.get(`${API_BASE_URL}/bayar/berhasil/${transactionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        clearCart();
        sessionStorage.removeItem('checkoutItems');
        sessionStorage.removeItem('selectedCartItemIds');
        alert('Pembayaran berhasil! Pesanan Anda telah dibuat.');
        navigate('/orders');
      } catch (error) {
        console.error('Error updating transaction status:', error);
      }
    };

    const handlePaymentFailure = async () => {
      alert('Pembayaran gagal. Silakan coba lagi.');
    };

    const handlePlaceOrder = async () => {
      if (!formValid) {
        alert('Mohon lengkapi semua data yang diperlukan');
        return;
      }
      if (checkoutItems.length === 0) {
        alert('Keranjang belanjaan Anda kosong');
        return;
      }
      setIsProcessing(true);
      try {
        const token = localStorage.getItem('token');
        let cartItemIds = [];

        if (selectedCartItemIds.length > 0) {
          cartItemIds = selectedCartItemIds;
        } else if (checkoutItems.every(item => item.keranjang_id)) {
          cartItemIds = checkoutItems.map(item => item.keranjang_id);
        } else {
          const cartResponse = await axios.get(`${API_BASE_URL}/keranjang`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (cartResponse.data && Array.isArray(cartResponse.data)) {
            checkoutItems.forEach(item => {
              const prodId = String(item.id);
              const bestMatch = cartResponse.data.find(
                cartItem => String(cartItem.id_produk) === prodId &&
                            (item.size ? cartItem.ukuran === item.size : true)
              );
              if (bestMatch) cartItemIds.push(bestMatch.keranjang_id);
            });
          }
        }

        if (cartItemIds.length === 0) {
          throw new Error('Tidak ada item keranjang untuk checkout.');
        }

        const payload = {
          total: total,
          id_alamat: selectedAddress,
          jenis_pembayaran: formData.paymentMethod === 'cash' ? 'tunai' : 'transfer',
          id_item: cartItemIds,
        };

        const response = await axios.post(`${API_BASE_URL}/bayar`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const { transaksi_id, snaptoken } = response.data;

        if (formData.paymentMethod === 'cash') {
          handlePaymentSuccess(transaksi_id);
        } else {
          processMidtransPayment(snaptoken);
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
        alert(error.response?.data?.message || error.message || 'Gagal memproses pembayaran');
        setIsProcessing(false);
      }
    };

    const selectedAddressDetails = addresses.find(addr => addr.alamat_id === selectedAddress) || null;

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FDC302]"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <header className="bg-white py-4 px-4 md:px-8 lg:px-12 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <img 
                src={logo} 
                alt="Nasi Kebuli Mutiara" 
                className="h-12 cursor-pointer" 
                onClick={() => navigate('/')}
              />
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-gray-800 hover:text-[#FDC302] font-medium">Home</a>
              <a href="/about" className="text-gray-800 hover:text-[#FDC302] font-medium">About Us</a>
              <a href="/menu" className="text-gray-800 hover:text-[#FDC302] font-medium">Menu</a>
              <button className="text-gray-800 hover:text-[#FDC302]">
                <FiSearch size={20} />
              </button>
              <a href="/cart" className="text-gray-800 hover:text-[#FDC302] relative">
                <FiShoppingBag size={20} />
                <span className="absolute -top-1 -right-1 bg-[#FDC302] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              </a>
              {(localStorage.getItem('authToken') || localStorage.getItem('token')) ? (
                <button 
                  onClick={() => {
                    const userRole = localStorage.getItem('userRole');
                    if(userRole === 'admin') navigate('/admin');
                    else if(userRole === 'pembeli') navigate('/customer');
                    else navigate('/login');
                  }}
                  className="px-8 py-3 bg-[#FDC302] text-black rounded-md hover:bg-yellow-600 shadow-lg transition duration-300 flex items-center"
                >
                  My Account <HiOutlineArrowNarrowRight className="ml-2" />
                </button>
              ) : (
                <a href="/login" className="px-8 py-3 bg-[#FDC302] text-black rounded-md hover:bg-yellow-600 shadow-lg transition duration-300 flex items-center">
                  Login <HiOutlineArrowNarrowRight className="ml-2" />
                </a>
              )}
            </div>
          </div>
        </header>

        <AddressSelectionModal 
          isOpen={isAddressModalOpen}
          onClose={closeAddressModal}
          addresses={addresses}
          selectedAddressId={selectedAddress}
          onSelectAddress={handleAddressSelect}
          onAddNewAddress={handleAddNewAddress}
        />

        <div className="container mx-auto py-8 px-4 md:px-8">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-2xl text-red-800 font-bold">Checkout</h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6">Informasi Pembeli:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-2">First name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDC302]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Last name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDC302]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-2">Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDC302]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">No. HP <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+62 8xx-xxxx-xxxx"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDC302]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6">Alamat Pengiriman: <span className="text-red-500">*</span></h2>
                {selectedAddressDetails ? (
                  <div className="border border-yellow-400 bg-yellow-50 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-red-800 font-semibold text-s">{selectedAddressDetails.label_alamat}</span>
                        <span className="text-xs text-gray-500">{selectedAddressDetails.no_telepon}</span>
                      </div>
                      <div className="mt-2 text-gray-700 text-sm leading-snug">
                        {selectedAddressDetails.detail}
                      </div>
                      <div className="text-gray-700 text-sm leading-snug">
                        {selectedAddressDetails.kelurahan}, {selectedAddressDetails.kecamatan}, {selectedAddressDetails.kabupaten}, {selectedAddressDetails.provinsi}
                      </div>
                    </div>
                    <button onClick={openAddressModal} className="text-yellow-400 hover:underline text-sm font-semibold">Ganti</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-300 rounded-md">
                    <p className="text-gray-500 mb-4">Kamu tidak mempunyai alamat pengiriman yang tersimpan</p>
                    <button onClick={handleAddNewAddress} className="px-4 py-2 bg-[#F9C847] text-black rounded-md hover:bg-[#FDC302] transition">
                      Tambah Alamat Baru
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6">Metode Pembayaran: <span className="text-red-500">*</span></h2>
                <div className="border border-gray-300 rounded-md mb-4">
                  <label className="flex items-center px-4 py-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="virtualAccount"
                      checked={formData.paymentMethod === 'virtualAccount'}
                      onChange={() => handlePaymentMethodChange('virtualAccount')}
                      className="mr-3"
                    />
                    <span className="flex-1 font-medium">Transfer Bank</span>
                  </label>
                </div>
                <div className="border border-gray-300 rounded-md mb-4">
                  <label className="flex items-center px-4 py-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={() => handlePaymentMethodChange('cash')}
                      className="mr-3"
                    />
                    <span className="flex-1 font-medium">Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="md:w-1/3">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-6">
                <h2 className="text-xl font-bold mb-4 text-center">Rincian Pembayaran</h2>
                <div className="space-y-3 mb-4">
                  <div className="border-b pb-3">
                    <h3 className="font-medium mb-2 text-sm">Rincian Produk:</h3>
                    {checkoutItems.length > 0 ? (
                      checkoutItems.map((item, idx) => (
                        <div key={`summary-${item.id}-${item.size || 'default'}-${idx}`} className="flex justify-between text-gray-700 mb-1 text-xs">
                          <span className="truncate max-w-[150px]">
                            {item.nama} {item.size ? `(${item.size})` : ''} ×{item.quantity}
                          </span>
                          <span>{formatPrice(parseFloat(item.harga) * item.quantity)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-xs italic">Keranjangmu kosong</p>
                    )}
                  </div>
                  <div className="flex justify-between py-1 text-sm">
                    <span>Sub Total</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b pb-3 text-sm">
                    <span>Pengiriman</span>
                    <span className="font-medium">{checkoutItems.length > 0 ? formatPrice(shippingCost) : 'Rp 0'}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total</span>
                    <span className="text-red-700">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || checkoutItems.length === 0 || !formValid}
                    className={`w-full py-3 px-6 bg-[#F9C847] text-black rounded-md flex items-center justify-center transition duration-300 ${
                      isProcessing || checkoutItems.length === 0 || !formValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FDC302]'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : (
                      <>
                        Pesan Sekarang <HiOutlineArrowNarrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Footer*/}
      <footer className="bg-red-900 text-white py-8 px-6 md:px-20 lg:px-32">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
            </div>
            <div className="lg:col-span-1">
              <h3 className="text-base font-semibold mb-4">Navigation</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <ul className="space-y-2">
                  <li>
                    <a href="/" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      About
                    </a>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li>
                    <a href="/menu" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Menu
                    </a>
                  </li>
                  <li>
                    <a href="/cart" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Keranjang
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start mb-3">
                    <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs">Alamat:</h4>
                      <p className="text-xs max-w-xs">
                        Jl. Villa Mutiara Cikarang blok H10, No.37, Ciantra, Cikarang Sel. Kab. Bekasi, Jawa Barat 17530
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start mb-3">
                    <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs">Email:</h4>
                      <p className="text-xs">
                        <a href="mailto:mutiara@gmail.com" className="hover:text-red-800 transition-colors">
                          mutiara@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-start md:justify-end">
                  <div className="flex space-x-3">
                    <a href="https://facebook.com/mutiaravillage" 
                      className="bg-red-800 p-1.5 rounded-md hover:bg-red-700 transition-colors"
                      aria-label="Facebook"
                      target="_blank" 
                      rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 2v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v7h-3v-7h-2v-3h2V7.5C13 5.57 14.57 4 16.5 4H19z"/>
                      </svg>
                    </a>
                    <a href="https://instagram.com/mutiaravillage" 
                      className="bg-red-800 p-1.5 rounded-md hover:bg-red-700 transition-colors" 
                      aria-label="Instagram"
                      target="_blank" 
                      rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                      </svg>
                    </a>
                    <a href="https://wa.me/6289797929390" 
                      className="bg-red-800 p-1.5 rounded-md hover:bg-red-700 transition-colors" 
                      aria-label="WhatsApp"
                      target="_blank" 
                      rel="noopener noreferrer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.94A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <div className="bg-red-900 text-white text-center py-3 px-6 md:px-20 lg:px-32">
        <div className="w-full h-px bg-red-800 mb-4"></div> 
        <div className="p-0 mt-0"></div>
        <div className="container mx-auto">
          <p className="text-xs">Copyright © 2025 Kebuli Mutiara. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
