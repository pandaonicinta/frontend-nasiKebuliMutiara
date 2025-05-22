import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';

const API_BASE_URL = 'http://kebabmutiara.xyz';

const getImageUrl = (imagePath) => {
  if (!imagePath) return foto;  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE_URL}/storage/${imagePath}`;
};

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState('Deskripsi');
  const [mainImage, setMainImage] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [menu, setMenu] = useState(null);
  const [relatedMenus, setRelatedMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, cartCount } = useContext(CartContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    // Check if user is logged in - using the same token keys as in Home.jsx
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(`${API_BASE_URL}/api/produk/${id}`);
        setMenu(response.data);

        try {
          const mainImageUrl = getImageUrl(response.data.gambar);
          setMainImage(mainImageUrl);
        } catch (imgErr) {
          console.error('Error processing product images:', imgErr);
          setMainImage(foto);
        }
        if (response.data.ukuran) {
          const sizes = response.data.ukuran.split(',').map(size => size.trim());
          if (sizes.length > 0) {
            setSelectedSize(sizes[0]);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load product data');
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (menu) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/produk`);
          const filteredProducts = response.data
            .filter(product => product.kategori === menu.kategori && product.produk_id !== menu.produk_id)
            .slice(0, 3); 

          setRelatedMenus(filteredProducts);
        } catch (err) {
          console.error('Error fetching related products:', err);
        }
      }
    };

    fetchRelatedProducts();
  }, [menu]);

  useEffect(() => {
    if (error) {
      navigate('/menu');
    }
  }, [error, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!menu) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Add to API cart function
  const addToApiCart = async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/api/keranjang/add`, 
      {
        id_produk: menu.produk_id,
        quantity: quantity,
        ukuran: selectedSize 
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("quanst", response.data);
    console.log("sd", response.message);
    return response.message;
  };

  // Add to local storage cart function 
  const addToLocalStorageCart = () => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex(
      item => item.produk_id === menu.produk_id && item.ukuran === selectedSize
    );
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].jumlah += quantity;
    } else {
      existingCart.push({
        produk_id: menu.produk_id,
        nama_produk: menu.nama_produk,
        harga: menu.harga,
        gambar: menu.gambar,
        jumlah: quantity,
        ukuran: selectedSize
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
  };

  const handleAddToCart = async () => {
    if (menu.stok <= 0) {
      alert('Maaf, produk ini sedang tidak tersedia.');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Create cart item object that's consistent between API and localStorage
      const cartItem = {
        id: menu.produk_id,
        name: menu.nama_produk,
        price: menu.harga,
        image: getImageUrl(menu.gambar),
        quantity: quantity,
        size: selectedSize
      };

      if (isAuthenticated) {
        try {
          // Try to add to API cart first
          await addToApiCart();
          console.log('Successfully added to API cart');
          
          // FIXED: Only update context after API success, not both API and localStorage
          // addToCart(cartItem);
          
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 3000);
        } catch (apiError) {
          console.error('API Cart Error:', apiError);
          
          // If API fails with 401, show login message
          if (apiError.response && apiError.response.status === 401) {
            alert('Sesi login Anda telah berakhir. Silakan login kembali.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            
            // FIXED: Use localStorage as fallback only when API fails
            addToLocalStorageCart();
            addToCart(cartItem);
          } else {
            // For other API errors, fall back to localStorage
            alert('Terjadi kesalahan saat menambahkan ke keranjang. Menggunakan penyimpanan lokal.');
            addToLocalStorageCart();
            addToCart(cartItem);
          }
        }
      } else {
        // Not logged in, use localStorage directly
        console.log('User not logged in, using localStorage cart');
        addToLocalStorageCart();
        // FIXED: Call addToCart only once when using localStorage
        addToCart(cartItem);
        
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      }
    } catch (err) {
      console.error('Error in handleAddToCart:', err);
      alert('Terjadi kesalahan saat menambahkan produk ke keranjang. Silakan coba lagi.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle account navigation (similar to Home.jsx)
  const handleAccountNavigation = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log("Button clicked! Token:", token, "UserRole:", userRole);
    
    if (token) {
      if (!userRole || userRole === "undefined" || userRole === "unknown") {
        axios.get('/aboutMe') 
          .then(response => {
            const role = response.data.role || response.data.user?.role;
            console.log("Fetched user role:", role);
            
            if (role) {
              localStorage.setItem('userRole', role);
              
              if (role === 'admin') {
                navigate('/admin');
              } else if (role === 'pembeli') {
                navigate('/customer');
              } else {
                console.log("Unknown user role after fetch:", role);
                navigate('/login');
              }
            } else {
              console.log("No role found in API response");
              navigate('/login');
            }
          })
          .catch(error => {
            console.error("Error fetching user info:", error);
            navigate('/login');
          });
      } else {
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'pembeli') {
          navigate('/customer');
        } else {
          console.log("Unknown user role:", userRole);
          navigate('/login');
        }
      }
    } else {
      navigate('/login');
    }
  };

  const sizes = menu.ukuran ? menu.ukuran.split(',').map(size => size.trim()) : [];
  const additionalInfo = {
    'Kategori': menu.kategori || 'N/A',
    'Ukuran': menu.ukuran || 'N/A',
    'Stok': menu.stok ? `${menu.stok} tersedia` : 'Habis',
    'ID Produk': menu.produk_id || 'N/A'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <header className="bg-white py-4 px-6 md:px-16 lg:px-32 w-full">
        <div className="flex justify-between items-center">
          <div>
            <img
              src={logo}
              alt="Nasi Kebuli Mutiara"
              className="h-12 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
          <div className="flex items-center space-x-8">
            <a href="/" className="text-gray-800 hover:text-[#FDC302] font-medium">Home</a>
            <a href="/about" className="text-gray-800 hover:text-[#FDC302] font-medium">Tentang Kami</a>
            <a href="/menu" className="text-[#FDC302] font-medium">Menu</a>
            <a href="/cart" className="text-gray-800 hover:text-[#FDC302] relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-[#FDC302] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </a>
            {isAuthenticated ? (
              <button 
                onClick={handleAccountNavigation}
                className="px-8 py-3 bg-yellow-500 text-white rounded-full flex items-center"
              >
                My Account <HiOutlineArrowNarrowRight className="ml-2" />
              </button>
            ) : (
              <a href="/login" className="px-8 py-3 bg-yellow-500 text-white rounded-full flex items-center">
                Login <HiOutlineArrowNarrowRight className="ml-2" />
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 md:px-16 lg:px-32">
        <div className="container mx-auto py-4 bg-white">
          <div className="flex items-center text-sm">
            <a href="/menu" className="text-gray-500 hover:text-[#FDC302]">Menu</a>
            <span className="mx-2">›</span>
            <span className="text-gray-700">{menu.nama_produk}</span>
          </div>
        </div>

        {/* Menu Detail Section */}
        <div className="container mx-auto py-8 bg-white">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <div className="bg-gray-100 rounded-lg mb-4 h-96 overflow-hidden">
                  <img 
                    src={getImageUrl(menu.gambar)}
                    alt={menu.nama_produk}
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.onerror = null; e.target.src = foto; }}
                  />
                </div>
              </div>

              {/* Menu Info */}
              <div className="lg:w-1/2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{menu.nama_produk}</h1>
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar key={star} className="text-[#FDC302]" />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">(5/5)</span>
                </div>
                <h2 className="text-2xl font-bold text-[#B22222] mb-6">{formatPrice(menu.harga)}</h2>
                <p className="text-gray-700 mb-6">{menu.deskripsi}</p>

                {/* Stock Status */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${menu.stok > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {menu.stok > 0 ? `Stok: ${menu.stok}` : 'Stok Habis'}
                  </span>
                </div>

                {/* Login status indicator (optional) */}
                {!isAuthenticated && (
                  <div className="mb-4">
                    <p className="text-amber-600 text-sm">
                      <span className="font-bold">Note:</span> You are not logged in. Items will be saved to local storage.
                      <a href="/login" className="ml-1 underline">Login</a> to save to your account.
                    </p>
                  </div>
                )}

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Ukuran:</h3>
                    <div className="flex space-x-4">
                      {sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-md flex items-center justify-center border ${
                            selectedSize === size ? 'border-[#FDC302] bg-[#FDC302] text-white' : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={decrement}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button 
                      onClick={increment}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className={`py-2 px-6 rounded-md transition duration-300 flex items-center ${
                      menu.stok > 0 
                        ? isAddingToCart 
                          ? 'bg-gray-400 text-white cursor-wait' 
                          : 'bg-[#B22222] text-white hover:bg-red-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={menu.stok <= 0 || isAddingToCart}
                  >
                    {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'} {!isAddingToCart && <HiOutlineArrowNarrowRight className="ml-2" />}
                  </button>
                </div>
                {addedToCart && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Berhasil! </strong>
                    {isAuthenticated ? (
                      <span className="block mt-1 text-sm">Menu disimpan di akunmu.</span>
                    ) : (
                      <span className="block mt-1 text-sm">Menu disimpan di local storage. <a href="/login" className="underline">Login</a> to save to your account.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="tabs-container w-full">
              <div className="flex justify-center">
                {['Deskripsi', 'Detail', 'Ulasan'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab === 'Detail' ? 'Additional Info' : tab)}
                    className={`px-6 py-3 font-bold ${
                      activeTab === (tab === 'Detail' ? 'Additional Info' : tab)
                        ? 'text-[#FDC302] border-b-2 border-[#FDC302]'
                        : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="py-6 border-t border-gray-200">
                {activeTab === 'Deskripsi' && (
                  <div className="max-w-3xl mx-auto text-center">
                    <p className="text-gray-500 font-medium">{menu.deskripsi}</p>
                  </div>
                )}
                
                {activeTab === 'Additional Info' && (
                  <div className="max-w-3xl mx-auto">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(additionalInfo).map(([key, value], index) => (
                          <tr key={key} className={index < Object.entries(additionalInfo).length - 1 ? "border-b border-gray-300" : ""}>
                            <td className="py-2 font-bold text-gray-500 capitalize w-1/3">{key}</td>
                            <td className="py-2 text-gray-500 font-medium">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {activeTab === 'Ulasan' && (
                  <div className="max-w-3xl mx-auto text-center">
                    <p className="text-gray-500">Belum ada ulasan, jadilah yang pertama meninggalkan ulasan!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-300 my-8"></div>

        {/* Related Products */}
        <div className="container mx-auto py-12">
          <h2 className="text-4xl font-berkshire mb-3 text-center font-bold">
            <span className="text-black">Menu </span>
            <span className="text-[#FDC302]">Terkait</span>
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Pilih dari beberapa menu terkait</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedMenus.length > 0 ? (
              relatedMenus.map(item => (
                <div
                  key={item.produk_id}
                  className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border border-[#FDC302] w-full max-w-xs mx-auto cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => navigate(`/menu/${item.produk_id}`)}
                >
                  <div className="relative pt-[66%] overflow-hidden">
                    <img
                      src={getImageUrl(item.gambar)}
                      alt={item.nama_produk}
                      className="absolute inset-0 w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = foto;
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">{item.nama_produk}</h3>
                    <p className="text-gray-700 mb-4 text-left flex-grow">
                      {item.deskripsi?.length > 100
                        ? `${item.deskripsi.substring(0, 100)}...`
                        : item.deskripsi || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex items-center text-[#FDC302]">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          {item.ukuran ? item.ukuran.split(',')[0].trim() : 'M'}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{formatPrice(item.harga)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/menu/${item.produk_id}`);
                      }}
                      className="w-full bg-[#FDC302] text-white py-2 px-4 rounded-full hover:bg-yellow-500 transition duration-300"
                    >
                      Beli Sekarang
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-8">
                No related products found
              </div>
            )}
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
                              Tentang Kami
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
        
                    {/* Contact Information Section  */}
                      <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row md:justify-between">
                          <div className="flex-1">
                            {/* Address */}
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
        
                            {/* Email */}
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
                        
                          {/* Social Media x  */}
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

export default MenuDetail;