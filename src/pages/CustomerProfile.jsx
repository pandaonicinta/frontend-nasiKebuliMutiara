import React, { useState, useEffect } from 'react';
import { FaUser, FaUserAlt } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';
import logo from '../assets/images/logo.png';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    // Fetch user profile data from localStorage or API
    const userName = localStorage.getItem('userName') || 'Agus Mutiara';
    const userEmail = localStorage.getItem('userEmail') || 'agus@gmail.com';
    const userPhone = localStorage.getItem('userPhone') || '0812 1234 1234';

    setProfile({
      fullName: userName,
      email: userEmail,
      phoneNumber: userPhone
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    // Reload original data
    const userName = localStorage.getItem('userName') || 'Agus Mutiara';
    const userEmail = localStorage.getItem('userEmail') || 'agus@gmail.com';
    const userPhone = localStorage.getItem('userPhone') || '0812 1234 1234';
    setProfile({
      fullName: userName,
      email: userEmail,
      phoneNumber: userPhone
    });
  };

  const handleSave = () => {
    // Save to localStorage or API
    localStorage.setItem('userName', profile.fullName);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('userPhone', profile.phoneNumber);
    // Exit edit mode
    setIsEditing(false);
  };

  const userName = profile.fullName.split(' ')[0] || 'Agus';

  return (
    <div className="flex min-h-screen bg-red-900">
      {/* Background pattern */}
      <div
        className="absolute top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Sidebar */}
      <CustomerSidebar activePage="profile" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        {/* Header with Title and User */}
        <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-6 shadow-xl">
          <h1 className="text-red-800 font-bold">Profile</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUserAlt className="mr-2 text-xs" />
            <span className="text-xs">{userName}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg overflow-hidden shadow-xl">
          {/* Profile Header with Avatar */}
          <div className="bg-red-800 p-6 pb-16 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center text-white">
                  <FaUser size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-12 px-6 pb-6">
            <div className="flex flex-col mb-4">
              <div className="text-xl font-bold">{userName}</div>
              <div className="text-gray-600 text-sm">{profile.email}</div>
            </div>
            <div className="absolute right-10 top-32">
              <div className="text-sm bg-white text-black border border-gray-300 rounded px-3 py-1 shadow-lg">
                <span className="drop-shadow-md">Customer</span>
              </div>
            </div>

            {/* Profile Details */}
            {isEditing ? (
              // Edit Form
              <div className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-inner shadow-gray-400 mb-6">
                  <div className="mb-6">
                    <label className="block text-red-800 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-red-800 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-red-800 font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 border border-red-800 text-red-800 rounded-lg text-sm"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-2 bg-red-800 text-white rounded-lg text-sm uppercase"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="mt-8">
                <div className="bg-white p-6 rounded-lg shadow-inner shadow-gray-400 mb-6">
                  <div className="mb-6">
                    <h3 className="text-red-800 font-medium mb-2">Full Name</h3>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                      {profile.fullName}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-red-800 font-medium mb-2">Email</h3>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                      {profile.email}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-red-800 font-medium mb-2">Phone Number</h3>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                      {profile.phoneNumber}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleEdit}
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
    </div>
  );
};

export default CustomerProfile;