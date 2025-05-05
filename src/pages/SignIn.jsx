import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import bg from '../assets/images/bglogin.png';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true); // Default to login mode
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'customer') {
      navigate('/customer');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (isLogin && (!formData.email || !formData.password)) {
      setError('Please enter both email and password');
      return;
    }
    
    if (!isLogin && (!formData.name || !formData.email || !formData.password)) {
      setError('Please fill in all fields');
      return;
    }
    
    // Reset error state if validation passes
    setError('');
    
    if (isLogin) {
      // Check credentials for role-based redirection
      if (formData.email === 'admin@gmail.com' && formData.password === '123456') {
        // Admin login
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Admin');
        navigate('/admin');
      } else if (formData.email === 'customer@gmail.com' && formData.password === '123456') {
        // Customer login
        localStorage.setItem('userRole', 'customer');
        localStorage.setItem('userName', 'Agus');
        navigate('/customer');
      } else {
        setError('Invalid email or password');
      }
    } else {
      // For sign up, we'll create a customer account
      localStorage.setItem('userRole', 'customer');
      localStorage.setItem('userName', formData.name);
      navigate('/customer');
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    // Clear form data when toggling between login and signup
    setFormData({
      name: '',
      email: '',
      password: ''
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
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h2>
          
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Name field - only shown in Sign Up mode */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isLogin ? 'LOG IN' : 'SIGN UP'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={toggleForm}
                className="font-medium text-red-800 hover:text-red-900"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;