import React from 'react';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import foto from '../assets/images/foto.png';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F9F7F0]">
      {/* Navigation Bar */}
      <header className="bg-white py-4 px-6 md:px-16 lg:px-24">
        <div className="flex justify-between items-center">
          <div>
            <img src={logo} alt="Nasi Kebuli Mutiara" className="h-12" />
          </div>
          <div className="flex items-center space-x-8">
            <a href="/" className="text-gray-800 hover:text-yellow-500 font-medium">Home</a>
            <a href="/about" className="text-yellow-500 font-medium">About Us</a>
            <a href="/menu" className="text-gray-800 hover:text-yellow-500 font-medium">Menu</a>
            <button className="text-gray-800 hover:text-yellow-500">
              <FiSearch size={20} />
            </button>
            <a href="/cart" className="text-gray-800 hover:text-yellow-500 relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">0</span>
            </a>
            <a href="/login" className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-white rounded-full hover:from-yellow-500 hover:to-yellow-400 shadow-lg transition duration-300 flex items-center">
              Login <HiOutlineArrowNarrowRight className="ml-2" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 md:px-16 lg:px-24 text-center">
        <h1 className="text-6xl font-berkshire text-gray-900 mb-6">About Us</h1>
        <div className="inline-block bg-white px-8 py-3 rounded-full shadow-sm">
          <span className="text-gray-800">About Us</span>
        </div>
      </section>

      {/* Wave Divider - More waves (at least 9) */}
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
              What Is Nasi <span className="text-yellow-400">Kebuli</span> Mutiara?
            </h2>
            <p className="text-gray-700 mb-6">
            Kedai Nasi Kebuli Mutiara** menyajikan nasi kebuli autentik dengan cita rasa kaya rempah, menggunakan daging kambing atau ayam yang empuk. Tempat yang nyaman dan harga terjangkau, ideal untuk menikmati hidangan Timur Tengah bersama keluarga atau teman. Nikmati pengalaman kuliner yang memuaskan dengan menu pendamping dan minuman segar yang melengkapi sajian utama.
            </p>
          </div>
        </div>
      </section>

      {/* Our Family Members Section */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-[#F9F7F0]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-berkshire mb-4">
            Our <span className="text-yellow-400">CEO</span>
          </h2>
          <p className="text-gray-700 mb-12">Get to know the friendly faces behind your favorite flavors.</p>
          
 
            {/* Family Members */}
            <div className="flex justify-center gap-8 px-10">
              {/* Member 1 */}
              <div className="flex flex-col items-center">
                <div className="rounded-full overflow-hidden w-48 h-48 mb-6">
                  <img src="/api/placeholder/200/200" alt="Team Member" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">CEO</h3>
                <p className="text-gray-600 mb-4">Bakery Worker</p>
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
            Our <span className="text-yellow-400">Location</span>
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

export default AboutUs;