import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartPie, FaUsers, FaShoppingCart, FaHome, FaSignOutAlt, FaInfo, FaUtensils } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const AdminSidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const response = await fetch('http://kebabmutiara.xyz/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('Logout API call failed:', response.status);
        }
      }

      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('authToken');
      sessionStorage.clear();

      window.location.href = '/';
      
    } catch (error) {
      console.error('Error during logout process:', error);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      
      setIsLoading(false);
      window.location.href = '/signin';
    }
  };
  

  return (
    <div className="fixed z-10 w-52 h-screen">
      <div className="h-full m-4 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="p-3 flex items-center justify-center">
          <div className="lg:col-span-1">
            <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
          </div>
        </div>
        <div className="p-2 flex-grow overflow-y-auto">
          <ul className="text-sm">
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