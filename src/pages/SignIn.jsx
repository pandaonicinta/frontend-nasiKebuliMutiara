import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import bg from '../assets/images/bglogin.png';
import axios from 'axios'; 

// Mengatur interceptor untuk menangani error
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

// Set axios defaults for API requests
axios.defaults.baseURL = 'http://kebabmutiara.xyz/api';
axios.defaults.headers.common['Accept'] = 'application/json';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true); // Default to login mode
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    gender: '',
    phone: '',
    picture: null
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (token) {
        // Set authorization header for any future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Optional: Validate token with your backend
          // const response = await axios.get('/validate-token');
          
          // Redirect based on user role
          if (userRole === 'admin') {
            navigate('/admin');
          } else if (userRole === 'pembeli') {
            navigate('/customer');
          }
        } catch (err) {
          // If token validation fails, clear storage and stay on login page
          console.error('Authentication validation error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          localStorage.removeItem('userUsername');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userPhone');
          localStorage.removeItem('userGender');
          localStorage.removeItem('userPicture');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prevState => ({
        ...prevState,
        picture: e.target.files[0]
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    if (isLogin) {
      if (!formData.username.trim()) {
        setError('Username tidak boleh kosong');
        return false;
      }
      if (!formData.password) {
        setError('Password tidak boleh kosong');
        return false;
      }
    } else {
      if (!formData.username.trim()) {
        setError('Username tidak boleh kosong');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email tidak boleh kosong');
        return false;
      }
      if (!formData.password) {
        setError('Password tidak boleh kosong');
        return false;
      }
      if (!formData.name.trim()) {
        setError('Nama lengkap tidak boleh kosong');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        // Login request
        const response = await axios.post('/login', {
          username: formData.username,
          password: formData.password
        });
        
        // Store token and user data
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userUsername', user.username);
        
        // Store additional user data if available
        if (user.email) localStorage.setItem('userEmail', user.email);
        if (user.phone) localStorage.setItem('userPhone', user.phone);
        if (user.gender) localStorage.setItem('userGender', user.gender);
        if (user.picture) localStorage.setItem('userPicture', user.picture);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Login berhasil. Token:', token);
        console.log('User data:', user);
        
        // Try to get complete user data right after login
        try {
          const userDataResponse = await axios.get('/aboutMe', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (userDataResponse.data && userDataResponse.data.data) {
            const userData = userDataResponse.data.data;
            if (userData.username) localStorage.setItem('userUsername', userData.username);
            if (userData.name) localStorage.setItem('userName', userData.name);
            if (userData.email) localStorage.setItem('userEmail', userData.email);
            if (userData.phone) localStorage.setItem('userPhone', userData.phone);
            if (userData.gender) localStorage.setItem('userGender', userData.gender);
            if (userData.picture) localStorage.setItem('userPicture', userData.picture);
            console.log('Retrieved additional user data:', userData);
          }
        } catch (userDataErr) {
          console.error('Error fetching additional user data:', userDataErr);
          // Continue with the login flow even if this fails
        }
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'pembeli') {
          navigate('/customer');
        }
      } else {
        // Register request
        // Create FormData for multipart/form-data (for image upload)
        const registerData = new FormData();
        registerData.append('username', formData.username);
        registerData.append('email', formData.email);
        registerData.append('password', formData.password);
        registerData.append('name', formData.name);
        
        // Add optional fields if provided
        if (formData.gender) registerData.append('gender', formData.gender);
        if (formData.phone) registerData.append('phone', formData.phone);
        if (formData.picture) registerData.append('picture', formData.picture);
        
        const registerResponse = await axios.post('/register', registerData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Registrasi berhasil:', registerResponse.data);
        
        // Save the registration data to localStorage for future use
        localStorage.setItem('tempUserUsername', formData.username);
        localStorage.setItem('tempUserEmail', formData.email);
        localStorage.setItem('tempUserPhone', formData.phone || '');
        localStorage.setItem('tempUserGender', formData.gender || '');
        
        // After successful registration, switch to login mode
        setIsLogin(true);
        setFormData({
          username: formData.username, // Keep username for convenience
          email: '',
          password: '',
          name: '',
          gender: '',
          phone: '',
          picture: null
        });
        
        // Show success message
        setSuccessMessage('Akun berhasil dibuat! Silakan login.');
      }
    } catch (err) {
      // Handle errors from API
      console.error('Error during API request:', err);
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
    // Clear form data when toggling between login and signup
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      gender: '',
      phone: '',
      picture: null
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{
      backgroundImage: `url(${bg})`,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backgroundBlendMode: 'overlay'
    }}>
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="py-8 px-6 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-3">
            <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
          </div>
          
          {/* Heading */}
          <h2 className="text-3xl font-bold font-berkshire text-red-800 mb-6">
            {isLogin ? 'Masuk' : 'Daftar'}
          </h2>
          
          {/* Error message */}
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Success message */}
          {successMessage && (
            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-red-800 mb-2">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            {/* Email field - only shown in Sign Up mode */}
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-red-800 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Masukkan alamat email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-red-800 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500 pr-10"
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
            
            {/* Additional fields for Sign Up */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-red-800 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-red-800 mb-2">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Pilih gender</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-red-800 mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Masukkan nomor telepon"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="picture" className="block text-sm font-medium text-red-800 mb-2">Foto Profil (Opsional)</label>
                  <input
                    type="file"
                    id="picture"
                    name="picture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 shadow focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </>
            )}
            
            {/* Login/Sign Up Button */}
            <div>
              <button
                type="submit"
                className="w-full bg-red-800 text-white p-3 rounded-lg shadow-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 uppercase"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Masuk...' : 'Mendaftar...'}</span>
                  </div>
                ) : (
                  isLogin ? 'Masuk' : 'Daftar'
                )}
              </button>
            </div>
            
            {/* Toggle between Login and Sign Up */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                <button
                  type="button"
                  onClick={toggleForm}
                  className="ml-2 text-red-800 hover:text-red-900 font-medium focus:outline-none"
                >
                  {isLogin ? 'Daftar sekarang' : 'Masuk'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;