import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaPencilAlt, FaTrash, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';

const CustomerAddress = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentAddress, setCurrentAddress] = useState({
    id: null,
    label_alamat: '',
    detail: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    is_utama: false
  });

  const apiUrl = 'https://kebabmutiara.xyz/api';
  
  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${apiUrl}/alamat`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      if (response.data && response.data.data) {
        setAddresses(response.data.data);
      } else {
        setAddresses([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      
      // Provide more specific error messages based on error type
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later or contact support.');
        } else {
          setError(`Error (${err.response.status}): ${err.response.data.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        setError('Failed to load addresses. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole || (userRole !== 'customer' && userRole !== 'pembeli')) {
      window.location.href = '/';
      return;
    }
    
    fetchAddresses();
  }, []);

  const handleEditAddress = (address) => {
    setCurrentAddress({
      id: address.id,
      label_alamat: address.label_alamat || '',
      detail: address.detail || '',
      kelurahan: address.kelurahan || '',
      kecamatan: address.kecamatan || '',
      kabupaten: address.kabupaten || '',
      provinsi: address.provinsi || '',
      is_utama: address.is_utama || false
    });
    setIsEditing(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        return;
      }
      
      setIsLoading(true);
      await axios.delete(`${apiUrl}/alamat/delete/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to delete address. Please try again later.');
      }
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        return;
      }
      
      setIsLoading(true);
      await axios.get(`${apiUrl}/alamat/primary/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      fetchAddresses();
    } catch (err) {
      console.error('Error setting primary address:', err);
      
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to set primary address. Please try again later.');
      }
      setIsLoading(false);
    }
  };

  const handleAddNewAddress = () => {
    setCurrentAddress({
      id: null,
      label_alamat: '',
      detail: '',
      kelurahan: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      is_utama: addresses.length === 0 // Make default if first address
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress({
      ...currentAddress,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!currentAddress.label_alamat.trim()) {
      setError('Address label is required');
      return false;
    }
    if (!currentAddress.detail.trim()) {
      setError('Address details are required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        return;
      }
      
      setIsLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      if (currentAddress.id) {
        // Update existing address
        await axios.post(
          `${apiUrl}/alamat/update/${currentAddress.id}`,
          currentAddress,
          { headers, timeout: 10000 }
        );
      } else {
        // Add new address
        await axios.post(
          `${apiUrl}/alamat/add`,
          currentAddress,
          { headers, timeout: 10000 }
        );
      }
      
      // Refresh addresses after saving
      fetchAddresses();
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving address:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 422) {
          setError('Invalid data. Please check your inputs.');
        } else {
          setError('Failed to save address. Please try again later.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to save address. Please try again later.');
      }
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isEditing && currentAddress.label_alamat && 
        !window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
      return;
    }
    setIsEditing(false);
    setError(null);
  };

  const customerName = localStorage.getItem('userName') || 'Customer';

  return (
    <div className="flex min-h-screen bg-red-900">
      <div
        className="absolute top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: `url(${aksen})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Sidebar */}
      <CustomerSidebar activePage="address" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-6">
          <h1 className="text-red-800 font-bold">Address</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUserAlt className="mr-2 text-xs" />
            <span className="text-xs">{customerName}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              {error.includes('server') && (
                <div className="mt-2 text-sm">
                  <p>Possible causes:</p>
                  <ul className="list-disc pl-5">
                    <li>API server is currently down</li>
                    <li>Your login session may have expired</li>
                    <li>Network connectivity issues</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {isLoading && !isEditing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
              <p className="mt-4">Loading addresses...</p>
            </div>
          ) : !isEditing ? (
            /* Address List View */
            <>
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {error ? 
                    <button 
                      onClick={fetchAddresses}
                      className="text-red-800 underline hover:no-underline"
                    >
                      Try loading addresses again
                    </button> :
                    "You don't have any saved addresses yet."
                  }
                </div>
              ) : (
                addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className="border border-red-800 rounded-lg p-4 mb-4 relative"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold">{address.label_alamat}</h3>
                        <p className="text-sm">{address.detail}</p>
                        <p className="text-sm">
                          {[address.kelurahan, address.kecamatan, address.kabupaten, address.provinsi]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {address.is_utama && (
                          <p className="text-xs text-blue-600 mt-2">This is your default delivery address</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!address.is_utama && (
                          <button 
                            onClick={() => handleSetPrimary(address.id)}
                            className="text-green-500 hover:text-green-700"
                            title="Set as primary address"
                          >
                            <FaCheck className="mr-1" />
                            <span className="text-xs font-bold">PRIMARY</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleEditAddress(address)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <span className="text-xs font-bold">EDIT</span>
                          <FaPencilAlt className="inline-block ml-1" />
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-gray-400 hover:text-red-500"
                          disabled={address.is_utama}
                          title={address.is_utama ? "Cannot delete primary address" : "Delete address"}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <button 
                onClick={handleAddNewAddress}
                className="w-full border border-red-800 bg-red-800 text-white rounded-md py-3 mt-6"
              >
                ADD NEW ADDRESS
              </button>
            </>
          ) : (
            /* Address Edit View */
            <>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Label Alamat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="label_alamat"
                    value={currentAddress.label_alamat}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                    placeholder="e.g., Home, Office, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Detail Alamat <span className="text-red-500">*</span></label>
                  <textarea
                    name="detail"
                    value={currentAddress.detail}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3 h-32"
                    placeholder="Street name, building number, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Kelurahan</label>
                  <input
                    type="text"
                    name="kelurahan"
                    value={currentAddress.kelurahan}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Kecamatan</label>
                  <input
                    type="text"
                    name="kecamatan"
                    value={currentAddress.kecamatan}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Kabupaten</label>
                  <input
                    type="text"
                    name="kabupaten"
                    value={currentAddress.kabupaten}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Provinsi</label>
                  <input
                    type="text"
                    name="provinsi"
                    value={currentAddress.provinsi}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
  
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={handleBack}
                    className="border border-red-800 text-red-800 px-6 py-2 rounded-md"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-red-800 text-white px-6 py-2 rounded-md"
                    disabled={isLoading}
                  >
                    {isLoading ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAddress;