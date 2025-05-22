import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';
import ceo from '../assets/images/ceo.png';
import axios from 'axios';

const AboutUs = () => {
  const navigate = useNavigate();
  const { cartCount } = useContext(CartContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAccountNavigation = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    console.log("Button clicked! Token:", token, "UserRole:", userRole); // Debugging
    
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
            if (error.response && error.response.status === 404) {
              console.error("User info endpoint not found (404)", error);
            } else {
              console.error("Error fetching user info:", error);
            }
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
  
  return (
    <div className="min-h-screen bg-[#F9F7F0]">
      {/* Navigation Bar */}
      <header className="bg-white py-4 px-6 md:px-16 lg:px-24">
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
            <Link to="/" className="text-gray-800 hover:text-yellow-500 font-medium">Home</Link>
            <Link to="/about" className="text-yellow-500 font-medium">Tentang Kami</Link>
            <Link to="/menu" className="text-gray-800 hover:text-yellow-500 font-medium">Menu</Link>
            <Link to="/cart" className="text-gray-800 hover:text-yellow-500 relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </Link>
            {isAuthenticated ? (
              <button 
                onClick={handleAccountNavigation}
                className="px-8 py-3 bg-yellow-500 text-white rounded-full flex items-center"
              >
                My Account <HiOutlineArrowNarrowRight className="ml-2" />
              </button>
            ) : (
              <Link to="/login" className="px-8 py-3 bg-yellow-500 text-white rounded-full flex items-center">
                Login <HiOutlineArrowNarrowRight className="ml-2" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 md:px-16 lg:px-24 text-center">
        <h1 className="text-6xl font-berkshire text-gray-900 mb-6">Tentang <span className="text-yellow-400">Kami</span></h1>
        <div className="inline-block bg-white px-8 py-3 rounded-full shadow-sm">
          <span className="text-gray-800">Kedai Nasi Kebuli Mutiara</span>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider relative h-32">
        <svg className="absolute bottom-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,64 C40,80 80,48 120,64 C160,80 200,48 240,64 C280,80 320,48 360,64 C400,80 440,48 480,64 C520,80 560,48 600,64 C640,80 680,48 720,64 C760,80 800,48 840,64 C880,80 920,48 960,64 C1000,80 1040,48 1080,64 C1120,80 1160,48 1200,64 C1240,80 1280,48 1320,64 C1360,80 1400,48 1440,64 L1440,120 L0,120 Z" fill="white"></path>
        </svg>
      </div>

      {/* Content Section */}
      <section className="py-12 px-6 md:px-16 lg:px-24 bg-white">
        <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src={foto} alt="Nasi Kebuli Plate" className="w-full h-auto rounded-full" />
          </div>
          <div className="md:w-1/2 md:pl-12">
            <h2 className="text-4xl font-berkshire text-gray-900 mb-6">
               Kedai Nasi <span className="text-yellow-400">Kebuli</span> Mutiara itu apa?
            </h2>
            <p className="text-gray-700 mb-6">
            Kedai Nasi Kebuli Mutiara menyajikan nasi kebuli autentik dengan cita rasa kaya rempah, menggunakan daging kambing atau ayam yang empuk. Tempat yang nyaman dan harga terjangkau, ideal untuk menikmati hidangan Timur Tengah bersama keluarga atau teman. Nikmati pengalaman kuliner yang memuaskan dengan menu pendamping dan minuman segar yang melengkapi sajian utama.
            </p>
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-[#F9F7F0]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-berkshire mb-4">
            CEO <span className="text-yellow-400">Kami</span>
          </h2>
            <div className="flex justify-center gap-8 px-10">
              <div className="flex flex-col items-center">
                <div className="rounded-full overflow-hidden w-48 h-48 mb-6">
                  <img src={ceo} alt="Team Member" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">CEO</h3>
                <p className="text-gray-600 mb-4">M. Farhan Nugraha</p>
                <div className="flex gap-2">
                  <a href="#" className="bg-red-800 text-white rounded-full p-2">
                    <FaInstagram size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Our Location Section */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-berkshire mb-12">
            Lokasi <span className="text-yellow-400">Kebuli Mutiara</span>
          </h2>
          
          <div className="rounded-lg overflow-hidden shadow-md">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.9554308997194!2d107.1459!3d-6.2874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTcnMTQuNiJTIDEwN8KwMDgnNDUuMiJF!5e0!3m2!1sen!2sid!4v1650000000000!5m2!1sen!2sid" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
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
      
export default AboutUs;