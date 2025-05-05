import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import aksen from '../assets/images/aksen.png';

const AddMenu = () => {
  const [menuData, setMenuData] = useState({
    name: '',
    description: '',
    price: '',
    size: 'M', // Default to Medium size
    picture: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuData({
      ...menuData,
      [name]: value
    });
  };

  const handleSaveClick = () => {
    // Logic to save menu
    console.log('Menu saved:', menuData);
    // You could redirect to menu page after saving
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Background with red top 1/3 and accent pattern */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
      </div>

      {/* Sidebar */}
      <AdminSidebar activePage="menu" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-800">Product</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Add Menu Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Menu Name</label>
            <input
              type="text"
              name="name"
              value={menuData.name}
              onChange={handleInputChange}
              placeholder="Nasi Kebuli Ayam"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Menu Description</label>
            <textarea
              name="description"
              value={menuData.description}
              onChange={handleInputChange}
              placeholder="Nasi kebuli dengan toping ayam........."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-32"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Menu Price</label>
            <input
              type="text"
              name="price"
              value={menuData.price}
              onChange={handleInputChange}
              placeholder="Rp. 20.000"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Size</label>
            <select
              name="size"
              value={menuData.size}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Picture</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <button className="bg-red-800 text-white px-4 py-2 rounded-lg mb-3">
                Add File
              </button>
              <p className="text-gray-500 text-sm">Or drag and drop files</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <Link
              to="/admin/menu"
              className="px-8 py-2 border border-red-800 text-red-800 rounded-lg"
            >
              BACK
            </Link>
            <button
              onClick={handleSaveClick}
              className="px-8 py-2 bg-red-800 text-white rounded-lg"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;