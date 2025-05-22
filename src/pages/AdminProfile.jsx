import React, { useState } from 'react';
import { FaUsers, FaUser } from 'react-icons/fa';
import aksen from '../assets/images/aksen.png';
import AdminSidebar from './AdminSidebar';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    shopName: 'Kebuli Mutiara',
    address: 'Jln. Raya Lodaya SV IPB',
    description: 'Kebuli Mutiara menjual berbagai ........'
  });

  const [editedData, setEditedData] = useState({...profileData});

  const handleEditClick = () => {
    setEditedData({...profileData});
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setProfileData({...editedData});
    setIsEditing(false);
  };

  const handleBackClick = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 bg-red-800 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
      </div>

      {/* Sidebar */}
      <AdminSidebar activePage="profile" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 p-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-xl">
          <h1 className="text-xl font-bold text-red-800">Profil</h1>
        </div>

        {/* Profile and Details Card */}
        <div className="bg-white rounded-lg shadow-xl mb-6">
          <div className="flex items-center p-6">
            <div className="mr-6">
              <div className="w-20 h-20 bg-red-800 rounded-full flex items-center justify-center">
                <FaUser size={40} className="text-white" />
              </div>
            </div>
            <div className="text-red-800">
              <h2 className="text-2xl font-bold">Kebuli Mutiara</h2>
              <p>kebuli@gmail.com</p>
            </div>
            <div className="ml-auto">
              <button className="bg-white text-red-800 px-4 py-1 rounded-lg text-sm font-bold border border-red-800 shadow-lg">
                <span className="drop-shadow-md">Admin</span>
              </button>
            </div>
          </div>
    
          <div className="bg-red-800 h-8"></div>
          
          {/* Profile Details */}
          {isEditing ? (
            // Edit Form
            <div className="p-6">
              <div className="bg-white p-6 rounded-lg shadow-inner shadow-gray-400 mb-6">
                <div className="mb-6">
                  <label className="block text-red-800 font-medium mb-2">Nama Restoran</label>
                  <input
                    type="text"
                    name="shopName"
                    value={editedData.shopName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-red-800 font-medium mb-2">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={editedData.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-red-800 font-medium mb-2">Deskripsi</label>
                  <textarea
                    name="description"
                    value={editedData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow h-32"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleBackClick}
                  className="px-6 py-2 border border-red-800 text-red-800 rounded-lg font-medium"
                >
                  KEMBALI
                </button>
                <button
                  onClick={handleSaveClick}
                  className="px-8 py-2 bg-red-800 text-white rounded-lg text-sm uppercase"
                >
                  SIMPAN
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="p-6">
              <div className="bg-white p-6 rounded-lg shadow-inner shadow-gray-400 mb-6">
                <div className="mb-6">
                  <h3 className="text-red-800 font-medium mb-2">Nama Restoran</h3>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                    {profileData.shopName}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-red-800 font-medium mb-2">Alamat</h3>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                    {profileData.address}
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-red-800 font-medium mb-2">Deskripsi</h3>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow min-h-32">
                    {profileData.description}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleEditClick}
                  className="px-8 py-2 bg-red-800 text-white rounded-lg text-sm uppercase shadow-md"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;