import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebookF, FaInstagram } from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';
import ramadhan from '../assets/images/ramadhan.png';
import ornamen from '../assets/images/ornamen.png';

const Home = () => {
  // Category data
  const categories = [
    { id: 1, name: "Nasi Kebuli", image: foto, slug: "nasi-kebuli" },
    { id: 2, name: "Paket Nampan Ayam", image: foto, slug: "paket-nampan-ayam" },
    { id: 3, name: "Paket Nampan Kambing", image: foto, slug: "paket-nampan-kambing" },
    { id: 4, name: "Paket Nampan Sapi", image: foto, slug: "paket-nampan-sapi" }
  ];

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
            <button className="text-gray-800 hover:text-yellow-500">
              <FiSearch size={20} />
            </button>
            <Link to="/cart" className="text-gray-800 hover:text-yellow-500 relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">0</span>
            </Link>
            <Link to="/login" className="px-8 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 shadow-lg transition duration-300 flex items-center">
              Login <HiOutlineArrowNarrowRight className="ml-2" />
            </Link>
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
      {/* Categories Section - Updated with React Router Links */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-5xl font-berkshire text-center mb-4">
            <span className="text-gray-900">Explore Our </span>
            <span className="text-yellow-400">Categories</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Browse through our different categories to find your favorite nasi kebuli.
          </p>
          
          {/* Updated Card Grid with proper React Router links */}
          <div className="flex justify-center gap-6 px-4">
            {categories.map(category => (
              <Link 
                key={category.id} 
                to={`/menu/${category.slug}`}
                className="rounded-lg shadow-xl overflow-hidden w-64 transform transition-transform hover:scale-105"
              >
                <div className="overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-100 to-white">
                  <img src={category.image} alt={category.name} className="w-full h-48 object-cover" />
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
              <Link to="#ramadhan-deal" className="px-8 py-4 bg-red-800 text-white rounded-full hover:bg-red-900 shadow-lg transition duration-300 inline-flex items-center">
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
      
      {/* Popular Menu Section */}
      <section className="py-16 bg-gradient-to-r from-[#FCFBF5] to-[#F9EAEA]">
        <div className="container mx-auto px-8">
          <h2 className="text-5xl font-berkshire text-center mb-4">
            <span className="text-gray-900">Most Popular </span>
            <span className="text-yellow-400">Kebuli</span>
            <span className="text-gray-900"> Menu</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Discover the nasi kebuli that our customers love the most.
          </p>
          <div className="flex justify-center gap-16">
            {/* Menu Item 1 */}
            <div className="flex flex-col items-center">
              <div className="p-1 rounded-full border-2 border-yellow-400 mb-4">
                <div className="rounded-full overflow-hidden w-64 h-64">
                  <img src={foto} alt="Paket Nampan Ayam" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center mb-2">
                <AiFillStar className="text-yellow-400" />
                <span className="ml-1 font-medium">4.9/5</span>
              </div>
              <h3 className="font-bold text-lg text-center mb-1">Paket</h3>
              <h3 className="font-bold text-lg text-center mb-4">Nampan Ayam</h3>
              <button className="px-6 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 shadow-md transition duration-300 flex items-center">
                Add to Cart <FiArrowRight className="ml-2" />
              </button>
            </div>
            {/* Menu Item 2 */}
            <div className="flex flex-col items-center">
              <div className="p-1 rounded-full border-2 border-yellow-400 mb-4">
                <div className="rounded-full overflow-hidden w-64 h-64">
                  <img src={foto} alt="Paket Nampan Kambing" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center mb-2">
                <AiFillStar className="text-yellow-400" />
                <span className="ml-1 font-medium">4.9/5</span>
              </div>
              <h3 className="font-bold text-lg text-center mb-1">Paket</h3>
              <h3 className="font-bold text-lg text-center mb-4">Nampan Kambing</h3>
              <button className="px-6 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 shadow-md transition duration-300 flex items-center">
                Add to Cart <FiArrowRight className="ml-2" />
              </button>
            </div>
            {/* Menu Item 3 */}
            <div className="flex flex-col items-center">
              <div className="p-1 rounded-full border-2 border-yellow-400 mb-4">
                <div className="rounded-full overflow-hidden w-64 h-64">
                  <img src={foto} alt="Paket Nampan Sapi" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex items-center mb-2">
                <AiFillStar className="text-yellow-400" />
                <span className="ml-1 font-medium">4.9/5</span>
              </div>
              <h3 className="font-bold text-lg text-center mb-1">Paket</h3>
              <h3 className="font-bold text-lg text-center mb-4">Nampan Sapi</h3>
              <button className="px-6 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 shadow-md transition duration-300 flex items-center">
                Add to Cart <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-5xl font-berkshire text-center mb-2">
            <span className="text-gray-900">Hear From Our </span>
            <span className="text-yellow-400">Kebuli</span>
          </h2>
          <h2 className="text-5xl font-berkshire text-center mb-6">
            <span className="text-gray-900">Enthusiasts</span>
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Read testimonials from those who have enjoyed our artisan kebuli.
          </p>

          <div className="flex justify-center gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-xl shadow-md p-8 flex flex-col">
              <div className="text-red-800 text-4xl font-serif mb-4">"</div>
              <p className="text-gray-600 mb-6">
                Ruisuam est rui dolorem ipsum rui do sit amet, consectetur, adipise velit seu non numquam eiusm temora incidunt aut labore siner...
              </p>
              <div className="mt-auto flex items-center">
                <img src="/api/placeholder/48/48" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                  </div>
                  <div className="font-bold text-red-800">Ciput</div>
                  <div className="text-sm text-gray-500">Happy Client</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-xl shadow-md p-8 flex flex-col">
              <div className="text-red-800 text-4xl font-serif mb-4">"</div>
              <p className="text-gray-600 mb-6">
                Nuisuam est rui dolorem ipsum rui do sit amet, consectetur, adipise velit seu non numquam eiusm temora incidunt aut labore siner...
              </p>
              <div className="mt-auto flex items-center">
                <img src="/api/placeholder/48/48" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                  </div>
                  <div className="font-bold text-red-800">Asep</div>
                  <div className="text-sm text-gray-500">Happy Client</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-xl shadow-md p-8 flex flex-col">
              <div className="text-red-800 text-4xl font-serif mb-4">"</div>
              <p className="text-gray-600 mb-6">
                Quisuam est rui dolorem ipsum rui do sit amet, consectetur, adipise velit seu non numquam eiusm temora incidunt aut labore siner...
              </p>
              <div className="mt-auto flex items-center">
                <img src="/api/placeholder/48/48" alt="Client" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                  </div>
                  <div className="font-bold text-red-800">Maman</div>
                  <div className="text-sm text-gray-500">Happy Client</div>
                </div>
              </div>
            </div>
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

export default Home