import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaUserAlt, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState({
    username: localStorage.getItem('userUsername') || '',
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: localStorage.getItem('userPhone') || '',
    gender: localStorage.getItem('userGender') || '',
    password: '',
    picture: localStorage.getItem('userPicture') || ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const fileInputRef = useRef(null);

  const apiUrl = 'http://kebabmutiara.xyz/api';

  // Fetch user profile data from API
  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // First try to get user data from the aboutMe endpoint
      const response = await axios.get(`${apiUrl}/aboutMe`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setProfile({
          username: userData.username || localStorage.getItem('userUsername') || '',
          name: userData.name || localStorage.getItem('userName') || '',
          email: userData.email || localStorage.getItem('userEmail') || '',
          phone: userData.phone || localStorage.getItem('userPhone') || '',
          gender: userData.gender || localStorage.getItem('userGender') || '',
          password: '',  // Password shouldn't be displayed for security reasons
          picture: userData.picture || localStorage.getItem('userPicture') || ''
        });
        
        // Update localStorage with the latest data
        if (userData.username) localStorage.setItem('userUsername', userData.username);
        if (userData.name) localStorage.setItem('userName', userData.name);
        if (userData.email) localStorage.setItem('userEmail', userData.email);
        if (userData.phone) localStorage.setItem('userPhone', userData.phone);
        if (userData.gender) localStorage.setItem('userGender', userData.gender);
        if (userData.picture) localStorage.setItem('userPicture', userData.picture);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
      
      // Attempt to fetch the user info directly if aboutMe fails
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${apiUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (userResponse.data && userResponse.data.user) {
          const userData = userResponse.data.user;
          setProfile({
            username: userData.username || localStorage.getItem('userUsername') || '',
            name: userData.name || localStorage.getItem('userName') || '',
            email: userData.email || localStorage.getItem('userEmail') || '',
            phone: userData.phone || localStorage.getItem('userPhone') || '',
            gender: userData.gender || localStorage.getItem('userGender') || '',
            password: '',  // Password shouldn't be displayed
            picture: userData.picture || localStorage.getItem('userPicture') || ''
          });
          
          // Update localStorage with the latest data
          if (userData.username) localStorage.setItem('userUsername', userData.username);
          if (userData.name) localStorage.setItem('userName', userData.name);
          if (userData.email) localStorage.setItem('userEmail', userData.email);
          if (userData.phone) localStorage.setItem('userPhone', userData.phone);
          if (userData.gender) localStorage.setItem('userGender', userData.gender);
          if (userData.picture) localStorage.setItem('userPicture', userData.picture);
          
          setError(null);
        }
      } catch (userErr) {
        console.error('Error fetching user data:', userErr);
        // Keep the existing error message
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          picture: e.target.result // Just for preview
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    // Reload original data from API
    fetchProfileData();
    // Reset picture file
    setProfilePictureFile(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create a form data object to handle file uploads
      const formData = new FormData();
      formData.append('username', profile.username);
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('gender', profile.gender);
      
      // Only append password if it was changed (non-empty)
      if (profile.password) {
        formData.append('password', profile.password);
      }
      
      // If there's a new picture file selected, append it
      if (profilePictureFile) {
        formData.append('picture', profilePictureFile);
      }
      
      const response = await axios.post(
        `${apiUrl}/aboutMe/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Profile update response:', response.data);
      
      // Update localStorage with all profile values
      localStorage.setItem('userUsername', profile.username);
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userEmail', profile.email);
      localStorage.setItem('userPhone', profile.phone);
      localStorage.setItem('userGender', profile.gender);
      
      // If the API returns an updated picture URL, save it
      if (response.data && response.data.data && response.data.data.picture) {
        localStorage.setItem('userPicture', response.data.data.picture);
      } else if (profile.picture && !profile.picture.startsWith('data:')) {
        // Keep the existing picture if it's a URL and not a data URL
        localStorage.setItem('userPicture', profile.picture);
      }
      
      // Reset the file input
      setProfilePictureFile(null);
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      // Refresh data to get the latest from server
      fetchProfileData();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Format gender for display
  const displayGender = () => {
    if (!profile.gender) return 'Not specified';
    if (profile.gender.toLowerCase() === 'male') return 'Laki-laki';
    if (profile.gender.toLowerCase() === 'female') return 'Perempuan';
    return profile.gender;
  };

  // Format email for display (remove duplicate @ if present)
  const displayEmail = () => {
    const email = profile.email || '';
    return email.replace(/^(.*)@@(.*)$/, '$1@$2');
  };

  // Get first name for display
  const userName = profile.name.split(' ')[0] || 'Customer';

  // Trigger the file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

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
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mt-6">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-6 mt-6">
              {successMessage}
            </div>
          )}

          {/* Profile Header with Avatar */}
          <div className="bg-red-800 p-6 pb-16 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center relative">
                {profile.picture ? (
                  <img 
                    src={profile.picture} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center text-white">
                    <FaUser size={32} />
                  </div>
                )}
                
                {isEditing && (
                  <div 
                    className="absolute -bottom-1 -right-1 bg-red-800 text-white p-1 rounded-full cursor-pointer hover:bg-red-900"
                    onClick={triggerFileInput}
                  >
                    <FaCamera size={16} />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-12 px-6 pb-6">
            <div className="flex flex-col mb-4">
              <div className="text-xl font-bold">{userName}</div>
              <div className="text-gray-600 text-sm">{displayEmail()}</div>
            </div>
            <div className="absolute right-10 top-32">
              <div className="text-sm bg-white text-black border border-gray-300 rounded px-3 py-1 shadow-lg">
                <span className="drop-shadow-md">Customer</span>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
                <p className="mt-2 text-gray-600">Loading profile...</p>
              </div>
            ) : (
              <>
                {/* Profile Details */}
                {isEditing ? (
                  // Edit Form
                  <div className="mt-8">
                    <div className="bg-white p-6 rounded-lg shadow-inner shadow-gray-400 mb-6">
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={profile.username}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
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
                        <label className="block text-red-800 font-medium mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={profile.password}
                            onChange={handleChange}
                            placeholder="Leave empty to keep current password"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow pr-10"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="text-gray-500" />
                            ) : (
                              <FaEye className="text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Gender</label>
                        <select
                          name="gender"
                          value={profile.gender || ''}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                        </select>
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Profile Picture</label>
                        <div className="flex items-center">
                          <div className="w-16 h-16 mr-4 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                            {profile.picture ? (
                              <img 
                                src={profile.picture} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <FaUser size={32} className="text-gray-400" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Change Picture
                          </button>
                        </div>
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
                        <h3 className="text-red-800 font-medium mb-2">Username</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {profile.username}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">Full Name</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {profile.name}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">Email</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {displayEmail()}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">Password</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          <span className="text-gray-500 italic">Password is encrypted</span>
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">Gender</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {displayGender()}
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">Phone Number</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {profile.phone || 'Not provided'}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;