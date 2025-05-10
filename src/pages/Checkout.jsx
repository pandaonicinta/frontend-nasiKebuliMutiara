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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Pilih Alamat Pengiriman</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <button 
            onClick={onAddNewAddress}
            className="w-full py-2 mb-4 bg-[#F9C847] text-black rounded-md hover:bg-[#FDC302] transition flex items-center justify-center"
          >
            + Tambah Alamat Baru
          </button>
          
          <div className="max-h-80 overflow-y-auto">
            {addresses && addresses.length > 0 ? (
              addresses.map(address => (
                <div 
                  key={address.alamat_id} 
                  className={`p-4 border mb-2 rounded-md cursor-pointer ${selectedAddressId === address.alamat_id ? 'border-[#FDC302] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => onSelectAddress(address.alamat_id)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{address.nama_penerima}</div>
                    <div className="text-sm text-gray-500">{address.no_telepon}</div>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {address.detail}, {address.kelurahan}, {address.kecamatan}, {address.kabupaten}, {address.provinsi}
                  </div>
                  {address.isPrimary && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
                      Utama
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Tidak ada alamat tersimpan</p>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2"
          >
            Batal
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#F9C847] text-black rounded-md hover:bg-[#FDC302]"
          >
            Konfirmasi
          </button>
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
  const [cartIsReady, setCartIsReady] = useState(false);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);
  
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

        const selectedFromSession = sessionStorage.getItem('checkoutItems');
        let items = [];
        
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
        
        if (selectedFromSession) {
          items = JSON.parse(selectedFromSession);
        } else {
          try {
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
            } else {
              const allCartResponse = await axios.get(`${API_BASE_URL}/keranjang`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (allCartResponse.data && Array.isArray(allCartResponse.data) && allCartResponse.data.length > 0) {
                items = allCartResponse.data.map(item => ({
                  id: item.id_produk,
                  nama: item.nama_produk,
                  harga: item.harga,
                  quantity: item.jumlah,
                  size: item.ukuran,
                  image: getImageUrl(item.gambar),
                  keranjang_id: item.keranjang_id 
                }));

                if (!savedCartItemIds) {
                  setSelectedCartItemIds(allCartResponse.data.map(item => item.keranjang_id));
                }
                
                setCartIsReady(true);
              } else {
                items = cartItems.map(item => ({
                  id: item.id,
                  nama: item.name,
                  harga: item.price,
                  quantity: item.quantity,
                  size: item.size || '',
                  image: item.image,
                  keranjang_id: item.cart_item_id 
                }));
              }
            }
          } catch (cartError) {
            console.error('Error fetching cart:', cartError);
            items = cartItems.map(item => ({
              id: item.id,
              nama: item.name,
              harga: item.price,
              quantity: item.quantity,
              size: item.size || '',
              image: item.image,
              keranjang_id: item.cart_item_id 
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    setFormData({
      ...formData,
      paymentMethod: method
    });
  };
  
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
  
  const handlePaymentSuccess = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.get(`${API_BASE_URL}/bayar/berhasil/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      clearCart();
      sessionStorage.removeItem('checkoutItems');
      sessionStorage.removeItem('selectedCartItemIds');
      
      alert('Payment successful! Your order has been placed.');
      navigate('/orders');
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };
  
  const handlePaymentFailure = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.get(`${API_BASE_URL}/bayar/gagal/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Payment failed. Please try again later.');
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
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
      }
      else if (checkoutItems.every(item => item.keranjang_id)) {
        cartItemIds = checkoutItems.map(item => item.keranjang_id);
      } 
      else {
        try {
          const cartResponse = await axios.get(`${API_BASE_URL}/keranjang`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (cartResponse.data && Array.isArray(cartResponse.data)) {
            checkoutItems.forEach(item => {
              const prodId = String(item.id);
              let bestMatch = cartResponse.data.find(
                cartItem => String(cartItem.id_produk) === prodId && 
                            (item.size ? cartItem.ukuran === item.size : true)
              );
              if (bestMatch) {
                cartItemIds.push(bestMatch.keranjang_id);
              }
            });
          }
        } catch (error) {
          console.error('Error fetching cart for ID matching:', error);
        }
      }
      
      if (cartItemIds.length === 0) {
        throw new Error('Tidak ada item keranjang yang tersedia untuk checkout. Silakan tambahkan produk ke keranjang Anda terlebih dahulu.');
      }
      
      // Debugging
      console.log('Cart Item IDs for checkout:', cartItemIds);
      console.log('Selected Address ID:', selectedAddress);
      
      const payload = {
        total: total,
        id_alamat: selectedAddress,
        id_item: cartItemIds
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
      let errorMessage = 'Gagal memproses pembayaran';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedAddressDetails = () => {
    if (!selectedAddress || !addresses || addresses.length === 0) return null;
    return addresses.find(addr => addr.alamat_id === selectedAddress);
  };

  const selectedAddressDetails = getSelectedAddressDetails();

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
          </div>
        </div>
      </header>

      <AddressSelectionModal 
        isOpen={isAddressModalOpen}
        onClose={closeAddressModal}
        addresses={addresses || []}
        selectedAddressId={selectedAddress}
        onSelectAddress={handleAddressSelect}
        onAddNewAddress={handleAddNewAddress}
      />

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
              
              {addresses && addresses.length > 0 && selectedAddressDetails ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">
                        {selectedAddressDetails.nama_penerima} • {selectedAddressDetails.no_telepon}
                      </div>
                      <div className="mt-2 text-gray-700">
                        {selectedAddressDetails.detail}
                      </div>
                      <div className="text-gray-700">
                        {selectedAddressDetails.kelurahan}, {selectedAddressDetails.kecamatan}, {selectedAddressDetails.kabupaten}, {selectedAddressDetails.provinsi}
                      </div>
                    </div>
                    <button 
                      onClick={openAddressModal} 
                      className="text-[#FDC302] hover:underline"
                    >
                      Ganti
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 mb-4">Kamu tidak mempunyai alamat pengiriman yang tersimpan</p>
                  <button
                    onClick={handleAddNewAddress}
                    className="px-4 py-2 bg-[#F9C847] text-black rounded-md hover:bg-[#FDC302] transition"
                  >
                    Tambah Alamat Baru
                  </button>
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6">Metode Pembayaran: <span className="text-red-500">*</span></h2>
              
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
                  <span className="flex-1 font-medium">Bank Virtual Account</span>
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
                  <span className="flex-1 font-medium">Cash on Delivery</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:w-1/3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold mb-4 text-center">Rincian Pembayaran</h2>
              
              <div className="space-y-3 mb-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-2 text-sm">Rincian Produk:</h3>
                  {checkoutItems.length > 0 ? (
                    checkoutItems.map((item, index) => (
                      <div key={`summary-${item.id}-${item.size || 'default'}-${index}`} className="flex justify-between text-gray-700 mb-1 text-xs">
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

              {/* Checkout Button */}
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