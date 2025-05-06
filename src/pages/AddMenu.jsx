import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import aksen from '../assets/images/aksen.png';

const AddMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [menuData, setMenuData] = useState({
    nama_produk: '',
    deskripsi: '',
    harga: '',
    ukuran: 'M', // Default to Medium size
    kategori: 'Nasi Kebuli', // Default category
    stok: 0,
    gambar: null
  });
  const [filePreview, setFilePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuData({
      ...menuData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMenuData({
        ...menuData,
        gambar: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      setMenuData({
        ...menuData,
        gambar: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Form validation
      if (!menuData.nama_produk || !menuData.deskripsi || !menuData.harga || !menuData.stok) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create FormData object to send file
      const formData = new FormData();
      formData.append('nama_produk', menuData.nama_produk);
      formData.append('deskripsi', menuData.deskripsi);
      formData.append('harga', menuData.harga);
      formData.append('ukuran', menuData.ukuran);
      formData.append('kategori', menuData.kategori);
      formData.append('stok', menuData.stok);
      
      if (menuData.gambar) {
        formData.append('gambar', menuData.gambar);
      }

      // Send data to API
      const response = await axios.post('http://kebabmutiara.xyz/api/produk/add', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Menu item added successfully!');
      navigate('/admin/menu');
    } catch (err) {
      console.error('Error adding menu item:', err);
      setError(err.response?.data?.message || 'Failed to add menu item. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-xl font-bold text-red-800">Add Menu</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUsers className="mr-2 text-sm" />
            <span className="text-sm font-medium">Admin</span>
          </div>
        </div>

        {/* Add Menu Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Menu Name*</label>
            <input
              type="text"
              name="nama_produk"
              value={menuData.nama_produk}
              onChange={handleInputChange}
              placeholder="Nasi Kebuli Ayam"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Category*</label>
            <select
              name="kategori"
              value={menuData.kategori}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <option value="Nasi Kebuli">Nasi Kebuli</option>
              <option value="Paket Nampan Ayam">Paket Nampan Ayam</option>
              <option value="Paket Nampan Kambing">Paket Nampan Kambing</option>
              <option value="Paket Nampan Sapi">Paket Nampan Sapi</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Description*</label>
            <textarea
              name="deskripsi"
              value={menuData.deskripsi}
              onChange={handleInputChange}
              placeholder="Nasi kebuli dengan toping ayam........."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-32"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Price*</label>
            <input
              type="number"
              name="harga"
              value={menuData.harga}
              onChange={handleInputChange}
              placeholder="20000"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            />
            <p className="text-gray-500 text-xs mt-1">Enter the price without 'Rp.' prefix</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Size*</label>
            <select
              name="ukuran"
              value={menuData.ukuran}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Stock*</label>
            <input
              type="number"
              name="stok"
              value={menuData.stok}
              onChange={handleInputChange}
              placeholder="100"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-red-800 font-medium mb-2">Picture</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileInput"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <button 
                    type="button" 
                    className="bg-red-800 text-white px-4 py-2 rounded-lg mb-3 flex items-center"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaUpload className="mr-2" /> Add File
                  </button>
                  <p className="text-gray-500 text-sm">Or drag and drop files</p>
                </div>
              </label>
              
              {filePreview && (
                <div className="mt-4">
                  <img src={filePreview} alt="Preview" className="w-40 h-40 object-cover mx-auto rounded-lg" />
                  <button
                    type="button"
                    className="mt-2 text-red-800 hover:text-red-900"
                    onClick={() => {
                      setFilePreview(null);
                      setMenuData({...menuData, gambar: null});
                      fileInputRef.current.value = '';
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
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
              disabled={loading}
              className={`px-8 py-2 bg-red-800 text-white rounded-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;