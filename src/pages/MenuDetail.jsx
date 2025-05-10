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
  const [activeTab, setActiveTab] = useState('Description');
  const [mainImage, setMainImage] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [menu, setMenu] = useState(null);
  const [relatedMenus, setRelatedMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart, cartCount } = useContext(CartContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

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
  const handleAddToCart = async () => {
    if (menu.stok <= 0) {
      alert('Maaf, produk ini sedang tidak tersedia.');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
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
          
          if (response.data) {
            console.log('Berhasil menambahkan ke keranjang:', response.data);

            const cartItem = {
              id: menu.produk_id,
              name: menu.nama_produk,
              price: menu.harga,
              image: getImageUrl(menu.gambar),
              quantity: quantity,
              size: selectedSize
            };

            addToCart(cartItem);

            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          handleLocalStorageCart();
          
          if (apiError.response && apiError.response.status === 401) {
            alert('Sesi login Anda telah berakhir. Silakan login kembali.');
          } else {
            alert('Terjadi kesalahan saat menambahkan produk ke keranjang. Menggunakan penyimpanan lokal sebagai cadangan.');
          }
        }
      } else {
        handleLocalStorageCart();
      }
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Terjadi kesalahan saat menambahkan produk ke keranjang. Silakan coba lagi.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleLocalStorageCart = () => {
    try {
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
      
      const cartItem = {
        id: menu.produk_id,
        name: menu.nama_produk,
        price: menu.harga,
        image: getImageUrl(menu.gambar),
        quantity: quantity,
        size: selectedSize
      };
      
      addToCart(cartItem);
      
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (localStorageErr) {
      console.error('Error managing cart in localStorage:', localStorageErr);
      alert('Terjadi kesalahan saat menambahkan produk ke keranjang. Silakan coba lagi.');
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
            <a href="/about" className="text-gray-800 hover:text-[#FDC302] font-medium">About Us</a>
            <a href="/menu" className="text-[#FDC302] font-medium">Menu</a>
            <a href="/cart" className="text-gray-800 hover:text-[#FDC302] relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-[#FDC302] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </a>
            <a href="/login" className="px-6 py-2 bg-gradient-to-r from-[#FDC302] to-yellow-300 text-white rounded-full hover:from-yellow-500 hover:to-yellow-400 shadow-md transition duration-300 flex items-center">
              Login <HiOutlineArrowNarrowRight className="ml-2" />
            </a>
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
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'} {!isAddingToCart && <HiOutlineArrowNarrowRight className="ml-2" />}
                  </button>
                </div>
                {addedToCart && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">{menu.nama_produk} ({selectedSize}) has been added to your cart.</span>
                  </div>
                )}
              </div>
            </div>
            <div className="tabs-container w-full">
              <div className="flex justify-center">
                {['Description', 'Additional Information', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab === 'Additional Information' ? 'Additional Info' : tab)}
                    className={`px-6 py-3 font-bold ${
                      activeTab === (tab === 'Additional Information' ? 'Additional Info' : tab)
                        ? 'text-[#FDC302] border-b-2 border-[#FDC302]'
                        : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="py-6 border-t border-gray-200">
                {activeTab === 'Description' && (
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
                
                {activeTab === 'Reviews' && (
                  <div className="max-w-3xl mx-auto text-center">
                    <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
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
            <span className="text-black">Related </span>
            <span className="text-[#FDC302]">Products</span>
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">Choose from some of related products</p>
          
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
                      Buy Now
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
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Shop
                    </a>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Products
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
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

export default MenuDetail;