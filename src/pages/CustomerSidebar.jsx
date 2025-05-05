import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHome, FaSignOutAlt, FaUser, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const CustomerSidebar = ({ activePage }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    
    // Navigate to the sign in page
    navigate('/');
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
              <Link
                to="/customer"
                className={`flex items-center p-2 ${activePage === 'order' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}
              >
                <span className={`${activePage === 'order' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaShoppingCart className="text-xs" />
                </span>
                <span className="text-xs">My Order</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/customer/review"
                className={`flex items-center p-2 ${activePage === 'review' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}
              >
                <span className={`${activePage === 'review' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaStar className="text-xs" />
                </span>
                <span className="text-xs">Review</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/customer/address"
                className={`flex items-center p-2 ${activePage === 'address' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}
              >
                <span className={`${activePage === 'address' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaMapMarkerAlt className="text-xs" />
                </span>
                <span className="text-xs">Address</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                to="/customer/profile"
                className={`flex items-center p-2 ${activePage === 'profile' ? 'bg-red-800 text-white' : 'hover:bg-gray-100'} rounded-lg`}
              >
                <span className={`${activePage === 'profile' ? 'p-1 bg-white text-red-800 rounded' : 'text-red-800'} mr-2`}>
                  <FaUser className="text-xs" />
                </span>
                <span className="text-xs">Profile</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2 bg-red-800 text-white rounded-lg text-xs"
          >
            <FaSignOutAlt className="mr-2 text-xs" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSidebar;