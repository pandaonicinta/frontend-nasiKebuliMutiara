import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import axios from 'axios';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';
import ramadhan from '../assets/images/ramadhan.png';
import ornamen from '../assets/images/ornamen.png';
import nampanayam from '../assets/images/PaketNampanAyam.png';
import nampankambing from '../assets/images/PaketNampanKambing.png';
import nampansapi from '../assets/images/PaketNampanSapi.png';

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


const Home = () => {
  const navigate = useNavigate();
  const [popularProducts, setPopularProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const categories = [
    { id: 1, name: "Nasi Kebuli", image: foto, slug: "nasi-kebuli" },
    { id: 2, name: "Paket Nampan Ayam", image: nampanayam, slug: "paket-nampan-ayam" },
    { id: 3, name: "Paket Nampan Kambing", image: nampankambing, slug: "paket-nampan-kambing" },
    { id: 4, name: "Paket Nampan Sapi", image: nampansapi, slug: "paket-nampan-sapi" }
  ];
  

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get('/produk');

        const productsData = response.data.data || [];
        const topProducts = productsData.slice(0, 3);
        
        // Format products for display
        const formattedProducts = topProducts.map(product => ({
          id: product.id,
          name: product.nama || "",
          image: product.gambar || foto,
          rating: product.rating || 4.9,
          price: product.harga || 0
        }));
        
        setPopularProducts(formattedProducts);
      } catch (err) {
        console.error("Error fetching popular products:", err);
        
        // Fallback data
        setPopularProducts([
          { id: 1, name: "Paket Nampan Ayam", image: foto, rating: 4.9 },
          { id: 2, name: "Paket Nampan Kambing", image: foto, rating: 4.9 },
          { id: 3, name: "Paket Nampan Sapi", image: foto, rating: 4.9 }
        ]);
      }
    };

    fetchPopularProducts();
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await axios.get('/keranjang');
          const cartItems = response.data.data || [];
          setCartCount(cartItems.length);
        } catch (err) {
          console.error("Error fetching cart:", err);
          // If unauthorized or other error, leave cart count at 0
        }
      }
    };

    fetchCartCount();
  }, []);


  useEffect(() => {
    // Haven't fetched it from api yet
    setTestimonials([
      {
        id: 1,
        text: "Enak banget, bumbunya ga pelit. Besok besok bakal beli di sini lagi pasti...",
        name: "Ciput",
        rating: 5
      },
      {
        id: 2,
        text: "Gurih, enak, pas sekali dengan selera saya. Bakal jadi langganan nih...",
        name: "Asep",
        rating: 5
      },
      {
        id: 3,
        text: "ENAKK. Menu favoriteku nasi kebuli kambing, bumbu kambingnya menyerap dengan pas dan ga bau sama sekali, fix nanti repeat order...",
        name: "Maman",
        rating: 5
      }
    ]);
  }, []);

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      await axios.post('/keranjang/add', {
        product_id: productId,
        quantity: 1
      });
      
      const response = await axios.get('/keranjang');
      const cartItems = response.data.data || [];
      setCartCount(cartItems.length);
      
      alert('Item added to cart!');
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleAccountNavigation = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log("Button clicked! Token:", token, "UserRole:", userRole); // Debugging
    
    if (token) {
      // Jika role kosong atau undefined, coba cek status user dari API
      if (!userRole || userRole === "undefined" || userRole === "unknown") {
        // Coba fetch user info dari API
        axios.get('/aboutMe') 
          .then(response => {
            // Pastikan response.data.role atau equivalent sesuai dengan API
            const role = response.data.role || response.data.user?.role;
            console.log("Fetched user role:", role);
            
            if (role) {
              // Simpan role yang baru didapat
              localStorage.setItem('userRole', role);
              
              // Navigasi berdasarkan role yang baru didapat
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
            // Error 404 atau kesalahan lainnya
            if (error.response && error.response.status === 404) {
              console.error("User info endpoint not found (404)", error);
            } else {
              console.error("Error fetching user info:", error);
            }
            // Jika gagal fetch, direct ke login saja
            navigate('/login');
          });
      } else {
        // Gunakan role yang sudah ada di localStorage
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
  
  
  // Example of what should be in your login component:
  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      
      // Save token and user role to localStorage dengan nama yang konsisten
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', response.data.user.role); // Make sure this matches your API response
      localStorage.setItem('userName', response.data.user.name || response.data.user.username);
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Show error message
    }
  };

  const handleLogout = () => {
    // Hapus semua data autentikasi
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    sessionStorage.clear();
  
    // Update UI setelah logout
    setIsAuthenticated(false); // Jika Anda menggunakan state untuk melacak status login
  
    // Redirect ke halaman login
    navigate('/login');
  };
  

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-[#EFECD7] via-[#FCFBF5] to-[#F9EAEA]">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-24 py-5">
          <div>
            <img src={logo} alt="Nasi Kebuli Mutiara" className="h-16" />
          </div>
          <div className="flex items-center space-x-10">
            <Link to="/" className="text-yellow-500 font-medium">Home</Link>
            <Link to="/about" className="text-gray-800 font-medium hover:text-yellow-500">About Us</Link>
            <Link to="/menu" className="text-gray-800 font-medium hover:text-yellow-500">Menu</Link>
            <Link to="/cart" className="text-gray-800 hover:text-yellow-500 relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </Link>
            {(localStorage.getItem('authToken') || localStorage.getItem('token')) ? (
              // Changed from Link to button with onClick handler
              <button 
                onClick={handleAccountNavigation}
                className="px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-lg transition duration-300 flex items-center"
              >
                My Account <HiOutlineArrowNarrowRight className="ml-2" />
              </button>
            ) : (
              <Link to="/login" className="px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-lg transition duration-300 flex items-center">
                Login <HiOutlineArrowNarrowRight className="ml-2" />
              </Link>
            )}
          </div>
        </nav>
        {/* Hero Section */}
        <section className="flex justify-between items-center px-28 py-16">
          <div className="w-1/2 pr-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-1 bg-gray-900 mr-4"></div>
              <h1 className="text-4xl font-extrabold font-berkshire text-gray-800">Selamat Datang</h1>
            </div>
            <div className="mb-8">
              <h2 className="text-7xl font-berkshire text-gray-900 leading-tight">
                <span className="text-gray-900">Nasi</span> <span className="text-yellow-500">Kebuli</span>
              </h2>
              <h2 className="text-7xl font-berkshire text-gray-900 leading-tight">
                <span className="text-gray-900">Mutiara</span>
              </h2>
            </div>
            <p className="text-lg text-gray-700 mb-8 max-w-lg">
            Nasi Kebuli Mutiara menyajikan nasi kebuli autentik dengan cita rasa rempah khas Timur Tengah. Disajikan lengkap dengan daging empuk, sambal, acar, dan kerupuk renyah. Cocok untuk pecinta kuliner khas dan lezat!
            </p>
            <Link to="/menu" className="px-8 py-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-lg transition duration-300 inline-flex items-center">
              Browse Our Classic Flavors <HiOutlineArrowNarrowRight className="ml-2" />
            </Link>
          </div>
          <div className="w-1/2 flex justify-center">
            <img src={foto} alt="Nasi Kebuli" className="w-5/6 h-auto rounded-full shadow-xl" />
          </div>
        </section>
        {/* Wave Divider - Smaller and with more waves */}
        <div className="wave-divider relative h-32">
        <svg className="absolute bottom-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,64 C40,80 80,48 120,64 C160,80 200,48 240,64 C280,80 320,48 360,64 C400,80 440,48 480,64 C520,80 560,48 600,64 C640,80 680,48 720,64 C760,80 800,48 840,64 C880,80 920,48 960,64 C1000,80 1040,48 1080,64 C1120,80 1160,48 1200,64 C1240,80 1280,48 1320,64 C1360,80 1400,48 1440,64 L1440,120 L0,120 Z" fill="white"></path>
        </svg>
      </div>

      </div>
    
      <section className="py-16 bg-white">
  <div className="container mx-auto px-8">
    <h2 className="text-5xl font-berkshire text-center mb-4">
      <span className="text-gray-900">Kategori Menu </span>
      <span className="text-yellow-400">Kami</span>
    </h2>
    <p className="text-center text-gray-600 mb-12">
      Jelajahi berbagai kategori menu kami untuk menemukan nasi kebuli favoritmu.
    </p>
    
    {/* Display static categories */}
    <div className="flex justify-center gap-6 px-4">
      {categories.map(category => (
        <Link 
          key={category.id} 
          to={`/menu/${category.slug}`}
          className="rounded-lg shadow-xl overflow-hidden w-64 transform transition-transform hover:scale-105"
        >
          <div className="overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-100 to-white">
            <img 
              src={category.image || foto} 
              alt={category.name} 
              className="w-full h-48 object-cover" 
              onError={(e) => { e.target.src = foto; }}
            />
          </div>
          <div className="relative">
            <div className="bg-white p-4">
              <div className="flex justify-between items-center bg-white border border-gray-200 rounded-md px-3 py-2">
                <h3 className="font-medium text-gray-800">{category.name}</h3>
                <FiArrowRight className="text-yellow-500" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>
      
      {/* Special Ramadhan Section - Updated with image background */}
      <section className="py-16 relative overflow-hidden" style={{ 
          backgroundImage: `url(${ramadhan})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="container mx-auto px-8">
          <div className="flex justify-between items-center">
            <div className="w-1/2 relative z-10">
              {/* Using the provided image for decorative elements */}
              <div className="absolute -left-16 -top-12">
                <img src={ornamen} alt="Ramadhan Decorations" className="w-40 h-auto" />
              </div>
              <h2 className="text-7xl font-berkshire text-red-800 leading-tight mb-4">
                Special<br />Ramadhan!
              </h2>
              <p className="text-2xl text-red-800 mb-8">Pesan Secepatnya!</p>
              <Link to="/menu/ramadhan-special" className="px-8 py-4 bg-red-800 text-white rounded-full hover:bg-red-900 shadow-lg transition duration-300 inline-flex items-center">
                Get This Deal <FiArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="w-1/2 relative">
              <img src={foto} alt="Special Ramadhan Dish" className="w-full h-auto rounded-full" />
              {/* Moved discount badge to left side of the image as shown in the photo */}
              <div className="absolute top-10 left-8 w-24 h-24 border-4 border-red-800 rounded-full flex items-center justify-center bg-yellow-400">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-800">50%</div>
                  <div className="text-lg font-bold text-red-800">OFF</div>
                </div>
              </div>
              {/* Dotted Line */}
              <div className="absolute top-0 right-0 w-full h-full">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40,80 Q120,40 200,120" stroke="white" strokeWidth="2" strokeDasharray="5,5" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Menu Section - Updated with API data */}
      <section className="py-16 bg-gradient-to-r from-[#FCFBF5] to-[#F9EAEA]">
        <div className="container mx-auto px-8">
          <h2 className="text-5xl font-berkshire text-center mb-4">
            <span className="text-gray-900">Menu </span>
            <span className="text-yellow-400">Kebuli</span>
            <span className="text-gray-900"> Paling Laris</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Temukan nasi kebuli yang paling disukai pelanggan kami.
          </p>
          <div className="flex justify-center gap-16">
            {/* Display popular products from API */}
            {popularProducts.map((product, index) => (
              <div key={product.id} className="flex flex-col items-center">
                <div className="p-1 rounded-full border-2 border-yellow-400 mb-4">
                  <div className="rounded-full overflow-hidden w-64 h-64">
                    <img 
                      src={product.image || foto} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = foto; }}
                    />
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <AiFillStar className="text-yellow-400" />
                  <span className="ml-1 font-medium">{product.rating}/5</span>
                </div>
                <h3 className="font-bold text-lg text-center mb-4">{product.name}</h3>
                <button 
                  className="px-6 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 shadow-md transition duration-300 flex items-center"
                  onClick={() => handleAddToCart(product.id)}
                >
                  Add to Cart <FiArrowRight className="ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - MODIFIED: Made review boxes equal height and width */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-5xl font-berkshire text-center mb-2">
            <span className="text-gray-900">Review Penggemar </span>
            <span className="text-yellow-400">Kebuli</span>
            <span className="text-gray-900"> Kami</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Baca review dari mereka yang telah menikmati kebuli buatan tangan kami.
          </p>

          <div className="flex justify-center gap-8 max-w-6xl mx-auto">
            {/* Map through testimonials with fixed height/width containers */}
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="bg-gray-50 rounded-xl shadow-md p-8 flex flex-col w-96 h-72"
              >
                <div className="text-red-800 text-4xl font-serif mb-4">"</div>
                <p className="text-gray-600 mb-6 flex-grow">
                  {testimonial.text}
                </p>
                <div className="mt-auto flex items-center">
                  <img src="/api/placeholder/48/48" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <AiFillStar key={i} />
                      ))}
                    </div>
                    <div className="font-bold text-red-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">Happy Client</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-10 space-x-2">
            <div className="w-3 h-3 bg-red-800 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </section>


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
                      <Link to="/" className="hover:text-yellow-400 flex items-center text-xs">
                        <span className="text-yellow-400 mr-2">•</span>
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/about" className="hover:text-yellow-400 flex items-center text-xs">
                        <span className="text-yellow-400 mr-2">•</span>
                        About
                      </Link>
                    </li>
                    <li>
                      <Link to="/menu" className="hover:text-yellow-400 flex items-center text-xs">
                        <span className="text-yellow-400 mr-2">•</span>
                        Shop
                      </Link>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/menu" className="hover:text-yellow-400 flex items-center text-xs">
                        <span className="text-yellow-400 mr-2">•</span>
                        Products
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog" className="hover:text-yellow-400 flex items-center text-xs">
                        <span className="text-yellow-400 mr-2">•</span>
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="hover:text-yellow-400 flex items-center text-xs">
                        <span className="text-yellow-400 mr-2">•</span>
                        Contact
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Contact Information Section - MODIFIED: Address with social icons to the right */}
              <div className="lg:col-span-2">
                <div className="flex flex-col md:flex-row md:justify-between">
                  {/* Address & Email Column */}
                  <div className="flex-1">
                    {/* Address */}
                    <div className="flex items-start mb-3">
                      <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs">Address:</h4>
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

                  {/* Social Media Icons Column - Moved to right side */}
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

  export default Home