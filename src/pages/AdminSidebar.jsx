import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChartPie, FaUsers, FaShoppingCart, FaHome, FaSignOutAlt, FaInfo, FaUtensils, FaArrowLeft } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const AdminSidebar = ({ activePage }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await fetch('http://kebabmutiara.xyz/api/logout', {
            method: 'GET', 
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
          });
          
          if (!response.ok) {
            console.error('Logout API call failed:', response.status);
          } else {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('token');
            sessionStorage.clear();
            window.location.replace('/');
          }
        } catch (apiError) {
          console.error('API error during logout:', apiError);
        }
      }
    } catch (error) {
      console.error('Error during logout process:', error);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      sessionStorage.clear();
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed z-10 w-52 h-screen pb-8">
      <div className="h-full m-4 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="p-3 flex items-center justify-center">
          <div className="lg:col-span-1">
            <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-2">
          <ul className="text-sm">
            <li className="mb-2">
              <Link to="/" className={`flex items-center p-2 ${activePage === 'home' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'home' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaArrowLeft className="text-xs" />
                </span>
                <span className="text-xs">Home</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin" className={`flex items-center p-2 ${activePage === 'dashboard' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'dashboard' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaChartPie className="text-xs" />
                </span>
                <span className="text-xs">Dashboard</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/orders" className={`flex items-center p-2 ${activePage === 'orders' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'orders' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaShoppingCart className="text-xs" />
                </span>
                <span className="text-xs">Order</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/review" className={`flex items-center p-2 ${activePage === 'review' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'review' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaInfo className="text-xs" />
                </span>
                <span className="text-xs">Review</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/customers" className={`flex items-center p-2 ${activePage === 'customers' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'customers' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaUsers className="text-xs" />
                </span>
                <span className="text-xs">Customer</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/profile" className={`flex items-center p-2 ${activePage === 'profile' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'profile' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaHome className="text-xs" />
                </span>
                <span className="text-xs">Profile</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link to="/admin/menu" className={`flex items-center p-2 ${activePage === 'menu' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={`${activePage === 'menu' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaUtensils className="text-xs" />
                </span>
                <span className="text-xs">Menu</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="p-3">
          <button 
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center justify-center w-full p-2 bg-red-800 text-white rounded-lg text-xs"
          >
            <FaSignOutAlt className="mr-2 text-xs" />
            <span>{isLoading ? 'LOADING...' : 'LOGOUT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;