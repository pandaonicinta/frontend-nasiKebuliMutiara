import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { CartContext } from '../contexts/CartContext';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';

const MenuCard = ({ item, handleMenuClick, navigate, getImageUrl, foto, formatCurrency }) => {
  const isLongDescription = item.deskripsi && item.deskripsi.length > 80;
  const displayDescription = isLongDescription 
    ? `${item.deskripsi?.substring(0, 80)}...`
    : item.deskripsi;

  return (
    <div
      className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border border-[#FDC302] w-full max-w-xs mx-auto cursor-pointer transform transition-transform hover:scale-105 h-[450px]"
      onClick={() => handleMenuClick(item.produk_id)}
    >
      <div className="relative h-48 overflow-hidden flex-shrink-0">
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

      <div className="p-4 flex flex-col flex-1 min-h-0">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-left line-clamp-2 h-14 flex items-start flex-shrink-0">
          {item.nama_produk}
        </h3>

        {/* Description Section */}
        <div className="text-gray-700 mb-4 text-left flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <p className="text-sm leading-relaxed line-clamp-3">
              {item.deskripsi || 'No description available'}
            </p>
          </div>
          {isLongDescription && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/menu/${item.produk_id}`);
              }}
              className="text-[#FDC302] text-xs font-medium mt-2 hover:text-yellow-600 transition duration-200 self-start flex-shrink-0"
            >
              View More
            </button>
          )}
        </div>

        {/* Fixed Bottom Section */}
        <div className="flex-shrink-0 mt-auto">
          <div className="flex items-center justify-between w-full mb-4 h-8">
            <div className="flex items-center text-[#FDC302]">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {item.ukuran || 'M'}
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(item.harga)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/menu/${item.produk_id}`);
            }}
            className="w-full bg-[#FDC302] text-white py-2 px-4 rounded-full hover:bg-yellow-500 transition duration-300"
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

const Menu = () => {
  const navigate = useNavigate();
  const { category } = useParams();
  const { cartCount } = useContext(CartContext);
  const [activeCategory, setActiveCategory] = useState("all");
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", name: "All Menu", slug: "all" },
  ]);
  const API_URL = 'http://kebabmutiara.xyz';

  const [userProfile, setUserProfile] = useState({
    profilePhoto: null,
    name: '',
    role: '',
    initials: ''
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  
  const getInitials = (name) => {
    if (!name) return 'U'; // Default to 'U' for User
    const nameParts = name.trim().split(' ');
    return nameParts[0].charAt(0).toUpperCase();
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    try {
      setIsProfileLoading(true);
      const response = await axios.get('/aboutMe');

      const userData = response.data;
      const role = userData.role;
      const name = userData.name;
      const profilePhoto = userData.picture; 

      console.log("Fetched user data:", userData); 

      setUserProfile({
        profilePhoto: profilePhoto || null, 
        name: name,
        role: role,
        initials: getInitials(name)
      });

      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name);
      
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfile({
        profilePhoto: null,
        name: localStorage.getItem('userName') || '',
        role: localStorage.getItem('userRole') || '',
        initials: getInitials(localStorage.getItem('userName') || '')
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const ProfilePhoto = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) return null;

    if (isProfileLoading) {
      return (
        <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
        </div>
      );
    }

    if (userProfile.profilePhoto) {
      return (
        <div className="relative">
          <img
            src={userProfile.profilePhoto}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 hover:border-yellow-500 transition-colors cursor-pointer shadow-md"
            onClick={handleAccountNavigation}
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-yellow-600 transition-colors shadow-md"
            style={{ display: 'none' }}
            onClick={handleAccountNavigation}
            title={userProfile.name || 'My Account'}
          >
            {userProfile.initials}
          </div>
        </div>
      );
    }

    return (
      <div
        className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-yellow-600 transition-colors shadow-md"
        onClick={handleAccountNavigation}
        title={userProfile.name || 'My Account'}
      >
        {userProfile.initials}
      </div>
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(); 
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleMenuClick = (menuId) => {
    navigate(`/menu/${menuId}`);
  };

  const handleAccountNavigation = async () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    let userRole = userProfile.role || localStorage.getItem('userRole');
    
    // If no role or invalid role, fetch user data once
    if (!userRole || userRole === "undefined" || userRole === "unknown") {
      try {
        const response = await axios.get('/aboutMe');
        const userData = response.data;
        userRole = userData.role;
        
        setUserProfile({
          profilePhoto: userData.picture || null,
          name: userData.name,
          role: userData.role,
          initials: getInitials(userData.name)
        });
        
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.name);
        
      } catch (error) {
        console.error("Error fetching user info:", error);
        navigate('/login');
        return;
      }
    }

    // Navigate based on role
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'pembeli') {
      navigate('/customer');
    } else {
      console.log("Unknown user role:", userRole);
      navigate('/login');
    }
  };

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/produk`);
        
        if (response.data && Array.isArray(response.data)) {
          setMenuItems(response.data);
          
          const uniqueCategories = [
            { id: "all", name: "Semua", slug: "all" }
          ];

          const categoryIds = new Set();
          
          response.data.forEach(item => {
            if (item.kategori && !categoryIds.has(item.kategori)) {
              categoryIds.add(item.kategori);
              uniqueCategories.push({
                id: item.kategori,
                name: item.kategori,
                slug: item.kategori.toLowerCase().replace(/\s+/g, '-')
              });
            }
          });
          
          setCategories(uniqueCategories);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Failed to load menu items. Invalid data format.');
        }
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [API_URL]);

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory("all");
    }
  }, [category]);

  useEffect(() => {
    let items = menuItems;
    
    if (activeCategory !== "all") {
      const categoryObj = categories.find(cat => cat.slug === activeCategory);
      if (categoryObj) {
        items = items.filter(item => 
          item.kategori && item.kategori.toLowerCase() === categoryObj.name.toLowerCase()
        );
      }
    }

    if (searchTerm.trim() !== '') {
      items = items.filter(item =>
        item.nama_produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(items);
  }, [activeCategory, searchTerm, menuItems, categories]);

  const handleCategoryChange = (categorySlug) => {
    navigate(`/menu/${categorySlug}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatCurrency = (price) => {
    if (!price) return 'Rp. 0';
    return `Rp. ${parseInt(price).toLocaleString('id-ID')}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return foto;
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_URL}/storage/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-[#F9F7F0]">
      {/* Navigation Bar */}
      <header className="bg-white">
        <nav className="flex justify-between items-center px-24 py-5">
          <div>
            <img 
              src={logo} 
              alt="Nasi Kebuli Mutiara" 
              className="h-16 cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>
          <div className="flex items-center space-x-10">
            <a href="/" className="text-gray-800 font-medium hover:text-yellow-500">Home</a>
            <a href="/about" className="text-gray-800 font-medium hover:text-yellow-500">Tentang Kami</a>
            <a href="/menu" className="text-yellow-500 font-medium">Menu</a>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari Menu..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 pr-4 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FDC302] focus:border-transparent"
              />
              <FiSearch size={16} className="absolute left-3 top-2 text-gray-400" />
            </div>
            <a href="/cart" className="text-gray-800 hover:text-yellow-500 relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </a>
            {isAuthenticated ? (
              <ProfilePhoto />
            ) : (
              <a href="/login" className="px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-lg transition duration-300 flex items-center">
                Login <HiOutlineArrowNarrowRight className="ml-2" />
              </a>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 md:px-16 lg:px-24 text-center">
        <h1 className="text-6xl font-berkshire mb-6">
          <span className="text-gray-900">Menu</span> <span className="text-[#FDC302]">Kami</span>
        </h1>
        <div className="inline-block bg-white px-8 py-3 rounded-full shadow-sm">
          <span className="text-gray-800">Jelajahi menu lezat kami</span>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider relative h-32">
        <svg className="absolute bottom-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,64 C40,80 80,48 120,64 C160,80 200,48 240,64 C280,80 320,48 360,64 C400,80 440,48 480,64 C520,80 560,48 600,64 C640,80 680,48 720,64 C760,80 800,48 840,64 C880,80 920,48 960,64 C1000,80 1040,48 1080,64 C1120,80 1160,48 1200,64 C1240,80 1280,48 1320,64 C1360,80 1400,48 1440,64 L1440,120 L0,120 Z" fill="white"></path>
        </svg>
      </div>

      {/* Category Tabs */}
      <section className="py-8 px-6 md:px-16 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === cat.slug
                    ? 'bg-[#FDC302] text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 w-full max-w-xs mx-auto h-[450px]">
                  <div className="animate-pulse h-full flex flex-col">
                    <div className="bg-gray-200 h-48"></div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6 mb-4 flex-1"></div>
                      <div className="flex justify-between mb-4">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded-full w-full mt-auto"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-xl text-red-600 mb-4">{error}</h3>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#FDC302] text-white py-2 px-6 rounded-full hover:bg-yellow-500 transition duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : filteredItems.length > 0 ? (
              // Menu items
              filteredItems.map((item) => (
                <MenuCard 
                  key={item.produk_id} 
                  item={item} 
                  handleMenuClick={handleMenuClick}
                  navigate={navigate}
                  getImageUrl={getImageUrl}
                  foto={foto}
                  formatCurrency={formatCurrency}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <h3 className="text-xl text-gray-600">No menu items found. Try a different category or search term.</h3>
              </div>
            )}
          </div>
        </div>
      </section>


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

export default Menu;