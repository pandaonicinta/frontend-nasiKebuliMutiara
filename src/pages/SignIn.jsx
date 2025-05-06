import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Login request
        if (!formData.username || !formData.password) {
          setError('Mohon masukkan username dan password');
          setIsLoading(false);
          return;
        }
        
        const response = await axios.post('/login', {
          username: formData.username,
          password: formData.password
        });
        
        // Store token and user data
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Login berhasil. Token:', token);
        console.log('User data:', user);
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'pembeli') {
          navigate('/customer');
        }
      } else {
        // Register request
        if (!formData.username || !formData.email || !formData.password || !formData.name) {
          setError('Mohon isi semua field yang diperlukan');
          setIsLoading(false);
          return;
        }
        
        const registerResponse = await axios.post('/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          gender: formData.gender || null,
          phone: formData.phone || null
        });
        
        console.log('Registrasi berhasil:', registerResponse.data);
        
        // After successful registration, switch to login mode
        setIsLogin(true);
        setFormData({
          username: formData.username, // Keep username for convenience
          email: '',
          password: '',
          name: '',
          gender: '',
          phone: ''
        });
        
        // Show success message
        setError('Akun berhasil dibuat! Silakan login.');
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
    // Clear form data when toggling between login and signup
    setFormData({
      username: '',
      email: '',
      password: '',
      name: '',
      gender: '',
      phone: ''
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
          
          {error && (
            <div className={`w-full border px-4 py-3 rounded mb-4 ${
              error.includes('berhasil') 
                ? 'bg-green-100 border-green-400 text-green-700' 
                : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            {/* Email field - only shown in Sign Up mode */}
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Masukkan alamat email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            {/* Name field - only shown in Sign Up mode */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
            
            {/* Additional fields for registration */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin (Opsional)</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon (Opsional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Masukkan nomor telepon"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-75"
              >
                {isLoading ? 'Memproses...' : (isLogin ? 'MASUK' : 'DAFTAR')}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                onClick={toggleForm}
                className="font-medium text-red-800 hover:text-red-900"
              >
                {isLogin ? "Daftar" : "Masuk"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;