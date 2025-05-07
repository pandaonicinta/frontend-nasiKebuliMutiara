import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { CartContext } from '../contexts/CartContext';
import axios from 'axios'; // Make sure to install axios if not already installed
import logo from '../assets/images/logo.png';

// Import payment method icons
import qrisIcon from '../assets/images/qris.png';
import bcaIcon from '../assets/images/bca.png';
import mandiriIcon from '../assets/images/mandiri.png';
import bniIcon from '../assets/images/bni.png';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, calculateTotal, clearCart, cartCount } = useContext(CartContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    paymentMethod: ''
  });
  const [formValid, setFormValid] = useState(false);
  
  // Calculate subtotal
  const subtotal = calculateTotal();
  
  // Fixed shipping cost
  const shippingCost = 10000;
  
  // Calculate total
  const total = subtotal + shippingCost;
  
  // Format price as Rp. XX.XXX
  const formatPrice = (price) => {
    return `Rp. ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };
  
  // Fetch user's saved addresses on component mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/alamat', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAddresses(response.data);
        
        // If addresses exist, select the first one by default
        if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id_alamat);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    
    // Get user data from localStorage or context
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setFormData(prevData => ({
      ...prevData,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      email: userData.email || '',
      phoneNumber: userData.phone || ''
    }));
    
    fetchAddresses();
  }, []);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle address selection
  const handleAddressChange = (e) => {
    setSelectedAddress(e.target.value);
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      paymentMethod: method
    });
  };
  
  // Validate form
  useEffect(() => {
    const { firstName, lastName, email, phoneNumber, paymentMethod } = formData;
    
    // Check if all required fields are filled
    const isValid = firstName.trim() !== '' && 
                    lastName.trim() !== '' && 
                    email.trim() !== '' && 
                    phoneNumber.trim() !== '' && 
                    selectedAddress !== '' &&
                    paymentMethod !== '';
    
    setFormValid(isValid);
  }, [formData, selectedAddress]);
  
  // Process midtrans payment
  const processMidtransPayment = (snapToken) => {
    window.snap.pay(snapToken, {
      onSuccess: function(result) {
        handlePaymentSuccess(result.order_id);
      },
      onPending: function(result) {
        alert('Payment pending, please complete your payment');
      },
      onError: function(result) {
        handlePaymentFailure(result.order_id);
      },
      onClose: function() {
        alert('You closed the payment window without completing payment');
      }
    });
  };
  
  // Handle successful payment
  const handlePaymentSuccess = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/transaksi/berhasil/${transactionId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      clearCart();
      alert('Payment successful! Your order has been placed.');
      navigate('/orders');
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };
  
  // Handle failed payment
  const handlePaymentFailure = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/transaksi/gagal/${transactionId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Payment failed. Please try again later.');
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };
  
  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!formValid) {
      alert('Please fill all required fields');
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Get cart item IDs
      const cartItemIds = cartItems.map(item => item.id);
      
      const response = await axios.post('/api/transaksi', {
        total: total,
        id_alamat: selectedAddress,
        id_item: cartItemIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const { transaksi_id, snaptoken } = response.data;
      
      // Handle payment based on selected method
      if (formData.paymentMethod === 'cash') {
        // For cash on delivery, just mark it as success
        handlePaymentSuccess(transaksi_id);
      } else {
        // For online payments, use Midtrans
        processMidtransPayment(snaptoken);
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(error.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsProcessing(false);
    }
  };

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
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Delivery Form */}
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
                    required
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
                    required
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
                    required
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
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Delivery Address Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6">Alamat Pengiriman: <span className="text-red-500">*</span></h2>
              
              {addresses.length > 0 ? (
                <div className="mb-4">
                  <select
                    value={selectedAddress}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FDC302]"
                  >
                    <option value="" disabled>Select a delivery address</option>
                    {addresses.map(address => (
                      <option key={address.id_alamat} value={address.id_alamat}>
                        {address.alamat} - {address.kecamatan}, {address.kota} {address.kode_pos}
                      </option>
                    ))}
                  </select>
                  
                  <div className="mt-4 text-right">
                    <button 
                      onClick={() => navigate('/profile/addresses/add')}
                      className="text-sm text-[#FDC302] hover:underline"
                    >
                      + Tambah Alamat Baru
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 mb-4">Kamu tidak mempunyai alamat pengiriman yang tersimpan</p>
                  <button
                    onClick={() => navigate('/profile/addresses/add')}
                    className="px-4 py-2 bg-[#F9C847] text-black rounded-md hover:bg-[#FDC302] transition"
                  >
                    Tambah Alamat Baru
                  </button>
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6">Metode Pembayaran: <span className="text-red-500">*</span></h2>
              
              {/* QRIS Payment */}
              <div className="border border-gray-300 rounded-md mb-4">
                <label className="flex items-center px-4 py-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="qris"
                    checked={formData.paymentMethod === 'qris'}
                    onChange={() => handlePaymentMethodChange('qris')}
                    className="mr-3"
                  />
                  <span className="flex-1">QRIS</span>
                  <div className="flex gap-2">
                    <img src={qrisIcon} alt="QRIS" className="h-6" />
                  </div>
                </label>
              </div>
              
              {/* Virtual Account Payment */}
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
                  <span className="flex-1">Virtual Account</span>
                  <div className="flex gap-2">
                    <img src={bcaIcon} alt="BCA" className="h-6" />
                    <img src={mandiriIcon} alt="Mandiri" className="h-6" />
                    <img src={bniIcon} alt="BNI" className="h-6" />
                  </div>
                </label>
              </div>
              
              {/* Cash on Delivery Payment */}
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
                  <span className="flex-1">Cash on Delivery</span>
                </label>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-6">
                  Dengan meng-klik tombol, kamu setuju dengan  
                  <a href="/terms" className="text-[#FDC302] ml-1">Syarat dan Ketentuan</a>
                </p>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || cartItems.length === 0 || !formValid}
                  className={`w-full py-3 px-6 bg-[#F9C847] text-black rounded-md flex items-center justify-center transition duration-300 ${
                    isProcessing || cartItems.length === 0 || !formValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FDC302]'
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
          
          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white border border-[#F9C847] rounded-lg p-4 shadow-sm sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-center">Rincian Pembayaran</h2>
              
              <div className="border-b pb-4 mb-4">
                <h3 className="font-medium mb-2 text-sm">Rincian Produk:</h3>
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={`summary-${item.id}`} className="flex justify-between text-gray-700 mb-1 text-xs">
                      <span className="truncate max-w-[150px]">{item.nama} x{item.quantity}</span>
                      <span>{formatPrice(item.harga * item.quantity)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs italic">Keranjangmu kosong</p>
                )}
              </div>
              
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-700">Sub Total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between py-1 border-b pb-3 text-sm">
                <span className="text-gray-700">Pengiriman</span>
                <span className="font-medium">{formatPrice(shippingCost)}</span>
              </div>
              
              <div className="flex justify-between py-4 font-bold">
                <span>Total</span>
                <span className="text-red-700">{formatPrice(total)}</span>
              </div>
              
              <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Safe and Secure Payments. Easy Returns.
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-1">100% Authentic Products</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-red-900 text-white py-8 px-6 md:px-20 lg:px-32 mt-16">
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
                  <li>
                    <a href="/menu" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Shop
                    </a>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li>
                    <a href="/menu" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Products
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Address */}
            <div className="lg:col-span-1">
              <div className="flex items-start mb-3">
                <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-xs">Address:</h4>
                  <p className="text-xs">
                    Jl. Villa Mutiara Cikarang blok H10, No.37, Ciantra, Cikarang Sel. Kab. Bekasi, Jawa Barat 17530
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-xs">Email:</h4>
                  <p className="text-xs">mutiara@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="bg-red-800 p-1.5 rounded-full mr-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold">+62 897-9792-939</h4>
                  <p className="text-xs">Got Questions? Call us 24/7</p>
                </div>
              </div>

              {/*Social Media */}
              <div className="flex justify-end space-x-3 mt-4">
                <a href="#" className="bg-red-800 p-1.5 rounded-md hover:bg-red-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="bg-red-800 p-1.5 rounded-md hover:bg-red-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.644.069 3.204 2.163 7.298 2.163 4.095 0 4.559-.012 4.85-.07 4.915-.188 6.445-1.718 6.633-6.632.058-1.29.07-1.752.07-4.85 0-3.098-.013-3.559-.07-4.849-.188-4.92-1.724-6.454-6.633-6.632-1.29-.058-1.752-.07-4.85-.07zm0 2.16c3.203 0 3.585.016 4.85.071 2.802.128 4.049 1.393 4.176 4.175.055 1.265.07 1.644.07 4.849 0 3.205-.015 3.586-.07 4.85-.127 2.783-1.374 4.048-4.176 4.176-1.265.055-1.647.07-4.85.07-3.201 0-3.584-.015-4.848-.07-2.802-.128-4.049-1.393-4.176-4.176-.055-1.264-.07-1.645-.07-4.85 0-3.205.015-3.584.07-4.849.127-2.783 1.374-4.048 4.176-4.175 1.264-.055 1.646-.07 4.848-.07zm0 3.676a5.16 5.16 0 100 10.32 5.16 5.16 0 000-10.32zm0 8.486a3.326 3.326 0 110-6.652 3.326 3.326 0 010 6.652zm6.532-8.694a1.206 1.206 0 11-2.413 0 1.206 1.206 0 012.413 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Section */}
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