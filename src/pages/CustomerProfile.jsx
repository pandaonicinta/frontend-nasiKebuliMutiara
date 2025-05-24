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

  const apiUrl = 'https://kebabmutiara.xyz/api';
  const storageUrl = 'https://kebabmutiara.xyz/storage';

  const getProfilePictureUrl = (picturePath) => {
    if (!picturePath) return '';
    if (picturePath.startsWith('http')) {
      return picturePath;
    } 
    else if (picturePath.startsWith('data:')) {
      return picturePath;
    }
    else if (picturePath.includes('foto_profile')) {
      return `${storageUrl}/${picturePath}`;
    }
    else {
      return `${storageUrl}/${picturePath}`;
    }
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${apiUrl}/aboutMe`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        const userData = response.data;
        const picturePath = userData.picture || '';
        console.log('API returned picture path:', picturePath);
        
        setProfile({
          username: userData.username || '',
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || '',
          password: '',  
          picture: picturePath 
        });
        
        localStorage.setItem('userUsername', userData.username || '');
        localStorage.setItem('userName', userData.name || '');
        localStorage.setItem('userEmail', userData.email || '');
        localStorage.setItem('userPhone', userData.phone || '');
        localStorage.setItem('userGender', userData.gender || '');
        localStorage.setItem('userPicture', userData.picture || '');
        
        console.log('Updated localStorage with picture path:', userData.picture || '');
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
      
      setProfile({
        username: localStorage.getItem('userUsername') || '',
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        phone: localStorage.getItem('userPhone') || '',
        gender: localStorage.getItem('userGender') || '',
        password: '',
        picture: localStorage.getItem('userPicture') || ''
      });
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
      const file = e.target.files[0];
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Foto Profil harus kurang dari 2MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      
      setProfilePictureFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          picture: e.target.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    fetchProfileData();
    setProfilePictureFile(null);
  };

  const updateProfilePicture = async () => {
    try {
      if (!profilePictureFile) {
        return null;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const formData = new FormData();
      formData.append('picture', profilePictureFile);
      
      const response = await axios.post(
        `${apiUrl}/aboutMe/updatePhoto`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Profile picture update response:', response.data);
      
      if (response.data && response.data.path) {
        localStorage.setItem('userPicture', response.data.path);
      }
      
      return response;
    } catch (err) {
      console.error('Error updating profile picture:', err);
      throw err;
    }
  };

  const updateProfileInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }
      
      const formData = new FormData();
      formData.append('username', profile.username.trim());
      formData.append('name', profile.name.trim());
      formData.append('email', profile.email.trim());
      
      if (profile.phone && profile.phone.trim()) {
        formData.append('phone', profile.phone.trim());
      }
      
      if (profile.gender) {
        formData.append('gender', profile.gender);
      }
      
      if (profile.password) {
        formData.append('password', profile.password);
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
      
      console.log('Profile info update response:', response.data);
      localStorage.setItem('userUsername', profile.username);
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userEmail', profile.email);
      localStorage.setItem('userPhone', profile.phone || '');
      localStorage.setItem('userGender', profile.gender || '');
      
      return response;
    } catch (err) {
      console.error('Error updating profile info:', err);
      throw err;
    }
  };

  const handleSave = async () => {
    try {
      if (!profile.username.trim()) {
        setError('Username is required');
        return;
      }
      
      if (!profile.name.trim()) {
        setError('Full name is required');
        return;
      }
      
      if (!profile.email.trim()) {
        setError('Email is required');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (profile.phone && !/^[0-9+\-\s]{6,20}$/.test(profile.phone)) {
        setError('Please enter a valid phone number');
        return;
      }

      setIsLoading(true);
      
      await updateProfileInfo();
      
      if (profilePictureFile) {
        await updateProfilePicture();
      }
      
      setProfilePictureFile(null);
      setIsEditing(false);
      
      setSuccessMessage('Profil berhasil diperbaharui!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      fetchProfileData();
      
    } catch (err) {
      console.error('Error in save operation:', err);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => {
        setError('');
      }, 5000);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const displayGender = () => {
    if (!profile.gender) return 'Not specified';
    if (profile.gender.toLowerCase() === 'male') return 'Laki-laki';
    if (profile.gender.toLowerCase() === 'female') return 'Perempuan';
    return profile.gender;
  };

  const displayEmail = () => {
    const email = profile.email || '';
    return email.replace(/^(.*)@@(.*)$/, '$1@$2');
  };

  const userName = profile.name ? profile.name.split(' ')[0] : 'Customer';

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const displayProfilePicture = () => {
    if (!profile.picture) return '';
    if (profile.picture.startsWith('data:')) {
      return profile.picture;
    }
    if (profile.picture.startsWith('http')) {
      return profile.picture;
    }
    return `${storageUrl}/${profile.picture}`;
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

      {/* Main Content - Fixed spacing */}
      <div className="relative z-10 flex-1 ml-46 p-6">
        <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-6 shadow-xl">
          <h1 className="text-red-800 font-bold">Profil</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUserAlt className="mr-2 text-xs" />
            <span className="text-xs">{userName}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg overflow-hidden shadow-xl">
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
          <div className="bg-red-800 p-6 pb-16 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center relative">
                {profile.picture ? (
                  <img 
                    src={displayProfilePicture()} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.onerror = null;
                      e.target.src = ''; 
                    }}
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
                      accept="image/jpeg,image/png,image/jpg"
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
              <div className="text-xl font-bold">{profile.name}</div>
              <div className="text-gray-600 text-sm">{displayEmail()}</div>
            </div>
            <div className="absolute right-10 top-32">
              <div className="text-sm bg-white text-black border border-gray-300 rounded px-3 py-1 shadow-lg">
                <span className="drop-shadow-md">Pembeli</span>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800"></div>
                <p className="mt-2 text-gray-600">Memuat Profile...</p>
              </div>
            ) : (
              <>
                {isEditing ? (
                  <div className="mt-8">
                    <div className="bg-white p-6 rounded-lg shadow-inner shadow-gray-400 mb-6">
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Username<span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          name="username"
                          value={profile.username}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                          required
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Nama Lengkap<span className="text-red-600">*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                          required
                        />
                      </div>
                      {/* <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Email<span className="text-red-600">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                          required
                        />
                      </div> */}
                      {/* <div className="mb-6">
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
                        <p className="text-sm text-gray-500 mt-1">Min. 8 characters</p>
                      </div> */}
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Jenis Kelamin</label>
                        <select
                          name="gender"
                          value={profile.gender || ''}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                        </select>
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">No. HP</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow"
                          placeholder="e.g., 08123456789"
                        />
                      </div>
                      <div className="mb-6">
                        <label className="block text-red-800 font-medium mb-2">Foto Profil</label>
                        <div className="flex items-center">
                          <div className="w-16 h-16 mr-4 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                            {profile.picture ? (
                              <img 
                                src={displayProfilePicture()} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = ''; 
                                }}
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
                            Ganti Foto
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Maksimal ukuran file: 2MB (hanya  JPG, JPEG, PNG)</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={handleBack}
                        className="px-6 py-2 border border-red-800 text-red-800 rounded-lg text-sm"
                      >
                        KEMBALI
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={`px-8 py-2 bg-red-800 text-white rounded-lg text-sm uppercase ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {isLoading ? 'Menyimpan...' : 'Simpan'}
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
                        <h3 className="text-red-800 font-medium mb-2">Nama Lengkap</h3>
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
                        <h3 className="text-red-800 font-medium mb-2">Kata Sandi</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          <span className="text-gray-500 italic">Kata Sandi dienskripsi</span>
                        </div>
                      </div>
                      {/* <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">Jenis Kelamin</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {displayGender()}
                        </div>
                      </div> */}
                      {/* <div className="mb-6">
                        <h3 className="text-red-800 font-medium mb-2">No. HP</h3>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 shadow">
                          {profile.phone || 'Not provided'}
                        </div>
                      </div> */}
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