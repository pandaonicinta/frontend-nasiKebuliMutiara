import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaPencilAlt, FaTrash, FaCheck, FaHome } from 'react-icons/fa';
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
    no_telepon: '', 
    is_utama: false
  });

  const apiUrl = 'http://kebabmutiara.xyz/api';
  
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
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      let addressData;
      if (Array.isArray(response.data)) {
        addressData = response.data;
      } else if (Array.isArray(response.data.data)) {
        addressData = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        addressData = [];
      }
      
      // Transform API response to match our frontend structure
      const transformedAddresses = addressData.map(address => ({
        id: address.alamat_id || address.id, // Handle both potential field names
        label_alamat: address.label_alamat,
        detail: address.detail,
        kelurahan: address.kelurahan,
        kecamatan: address.kecamatan,
        kabupaten: address.kabupaten,
        provinsi: address.provinsi,
        no_telepon: address.no_telepon,
        is_utama: address.isPrimary === 1 || address.isPrimary === true // Convert from backend isPrimary to frontend is_utama
      }));
      
      setAddresses(transformedAddresses);
      setError(null);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 3000);
        } else if (err.response.status === 403 && err.response.data?.message === 'Kamu belum ada alamat utama') {
          // Handle the specific message from the API when no primary address exists
          setAddresses([]);
          setError(null); // Don't show as an error since this is expected for new users
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later or contact support.');
        } else {
          setError(`Error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
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

  // Enhanced handleSetPrimary function implementation
  const handleSetPrimary = async (addressId) => {
    if (!addressId && addressId !== 0) {
      setError('Invalid address ID for setting as primary');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        return;
      }
      
      setIsLoading(true);
      
      // Use the primary endpoint consistently
      await axios.get(`${apiUrl}/alamat/primary/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      // Show success message
      setError(null);
      
      // Update the local state to reflect the address as primary before fetching
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_utama: addr.id === addressId
      })));
      
      // Then refresh from server to ensure we're in sync
      await fetchAddresses();
    } catch (err) {
      console.error('Error setting address as primary:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 404) {
          setError('Address not found.');
        } else {
          setError(`Failed to set address as primary: ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to set address as primary. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    // Fix 2: Ensure we're properly setting all fields from the existing address
    setCurrentAddress({
      id: address.id || null,
      label_alamat: address.label_alamat || '',
      detail: address.detail || '',
      kelurahan: address.kelurahan || '',
      kecamatan: address.kecamatan || '',
      kabupaten: address.kabupaten || '',
      provinsi: address.provinsi || '',
      no_telepon: address.no_telepon || '',
      is_utama: address.is_utama || false
    });
    setIsEditing(true);
  };

  const handleDeleteAddress = async (addressId) => {
    // Fix 1: Check for null/undefined AND also check for empty string
    if (!addressId && addressId !== 0) {
      setError('Invalid address ID for deletion');
      return;
    }

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
      // Adjusted to match the backend route (from the controller's destroy method)
      await axios.delete(`${apiUrl}/alamat/delete/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      fetchAddresses();
      setError(null);
    } catch (err) {
      console.error('Error deleting address:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 404) {
          setError('Address not found. It may have been already deleted.');
          fetchAddresses();
        } else if (err.response.status === 403 || err.response.status === 422) {
          // This might happen if trying to delete a primary address
          setError(`Cannot delete address: ${err.response.data?.message || 'This address cannot be deleted'}`);
        } else {
          setError(`Failed to delete address: ${err.response.data?.message || err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to delete address. Please try again later.');
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
      no_telepon: '',
      is_utama: addresses.length === 0 // First address will be the primary
    });
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'no_telepon') {
      setCurrentAddress({
        ...currentAddress,
        no_telepon: value 
      });
    } else {
      setCurrentAddress({
        ...currentAddress,
        [name]: value
      });
    }
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
    if (!currentAddress.no_telepon.trim()) {
      setError('Phone number is required');
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
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Updated payload to match backend field names
      const payload = {
        label_alamat: currentAddress.label_alamat,
        detail: currentAddress.detail,
        kelurahan: currentAddress.kelurahan || '',
        kecamatan: currentAddress.kecamatan || '', 
        kabupaten: currentAddress.kabupaten || '',
        provinsi: currentAddress.provinsi || '',
        no_telepon: currentAddress.no_telepon || '', 
        // Match backend field name - use 1 or 0 for isPrimary
        isPrimary: currentAddress.is_utama ? 1 : 0
      };

      // Ensure we're checking for id properly and using correct endpoint
      if (currentAddress.id !== null && currentAddress.id !== undefined) {
        // Update address - adjusted to match the controller's update method
        await axios.post(
          `${apiUrl}/alamat/update/${currentAddress.id}`,
          payload,
          { headers }
        );
        
        // If we're setting this address as primary, use the primary endpoint consistently
        if (currentAddress.is_utama) {
          await axios.get(
            `${apiUrl}/alamat/primary/${currentAddress.id}`,
            { headers }
          );
        }
      } else {
        // Add new address - adjusted to match the controller's store method
        const response = await axios.post(
          `${apiUrl}/alamat/add`,
          payload,
          { headers }
        );
        
        // If this is set as primary and the backend returns the new address ID
        // Use the primary endpoint to set it as primary consistently
        if (currentAddress.is_utama && response.data?.alamat_id) {
          await axios.get(
            `${apiUrl}/alamat/primary/${response.data.alamat_id}`,
            { headers }
          );
        }
      }
      
      await fetchAddresses();
      setIsEditing(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving address:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 422) {
          const validationErrors = err.response.data?.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setError(`Validation error: ${errorMessages}`);
          } else {
            setError('Invalid data. Please check your inputs.');
          }
        } else {
          setError(`Failed to save address: ${err.response.data?.message || 'Unknown error'}`);
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
    if (isEditing && (currentAddress.label_alamat || currentAddress.detail) && 
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
          <h1 className="text-red-800 font-bold">Address Management</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUserAlt className="mr-2 text-xs" />
            <span className="text-xs">{customerName}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
              <span className="block sm:inline">{error}</span>
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
              <button 
                onClick={() => setError(null)}
                className="absolute top-0 right-0 px-4 py-3"
              >
                <span className="text-red-700 font-bold">×</span>
              </button>
            </div>
          )}

          {isLoading && !isEditing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
              <p className="mt-4">Loading addresses...</p>
            </div>
          ) : !isEditing ? (
            <>
              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <FaHome className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    {error ? 'Failed to load addresses' : "You don't have any saved addresses yet."}
                  </p>
                  {error && (
                    <button 
                      onClick={fetchAddresses}
                      className="text-red-800 underline hover:no-underline"
                    >
                      Try loading addresses again
                    </button>
                  )}
                </div>
              ) : (
                addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className={`border rounded-lg p-4 mb-4 relative ${address.is_utama ? 'border-red-800 shadow-md' : 'border-gray-200'}`}
                  >
                    {address.is_utama && (
                      <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        UTAMA
                      </span>
                    )}

                    <div className="mb-6">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-bold text-lg text-red-800">{address.label_alamat}</h3>
                          {address.no_telepon && (
                            <span className="ml-2 text-sm text-gray-500">
                              • {address.no_telepon}
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1">{address.detail}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {[address.kelurahan, address.kecamatan, address.kabupaten, address.provinsi]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 flex space-x-2">
                      {!address.is_utama && (
                        <button 
                          onClick={() => handleSetPrimary(address.id)}
                          className="flex items-center justify-center px-3 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors text-xs font-medium"
                          title="Set as primary address"
                        >
                          Set as Primary
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleEditAddress(address)}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Edit address"
                      >
                        <FaPencilAlt size={14} />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteAddress(address.id)}
                        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
                          address.is_utama 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        disabled={address.is_utama}
                        title={address.is_utama ? "Cannot delete default address" : "Delete address"}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button 
                onClick={handleAddNewAddress}
                className="w-full bg-red-800 text-white rounded-md py-3 mt-6 hover:bg-red-900 transition-colors flex items-center justify-center"
              >
                <FaHome className="mr-2" /> ADD NEW ADDRESS
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-red-800 mb-6">
                {currentAddress.id ? 'Edit Address' : 'Add New Address'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Label Alamat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="label_alamat"
                    value={currentAddress.label_alamat}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3"
                    placeholder="e.g., Home, Office, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Detail Alamat <span className="text-red-500">*</span></label>
                  <textarea
                    name="detail"
                    value={currentAddress.detail}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3 h-32"
                    placeholder="Street name, building number, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Kelurahan</label>
                    <input
                      type="text"
                      name="kelurahan"
                      value={currentAddress.kelurahan}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Kecamatan</label>
                    <input
                      type="text"
                      name="kecamatan"
                      value={currentAddress.kecamatan}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Kabupaten</label>
                    <input
                      type="text"
                      name="kabupaten"
                      value={currentAddress.kabupaten}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-600 text-sm mb-2">Provinsi</label>
                    <input
                      type="text"
                      name="provinsi"
                      value={currentAddress.provinsi}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">NO. HP <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="no_telepon"
                    value={currentAddress.no_telepon}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-red-800 focus:ring-1 focus:ring-red-800 rounded-lg p-3"
                    placeholder="e.g., 081234567890"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number is required by the system</p>
                </div>
  
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={handleBack}
                    className="border border-red-800 text-red-800 px-6 py-2 rounded-md hover:bg-red-50 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-red-800 text-white px-6 py-2 rounded-md hover:bg-red-900 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        SAVING...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" /> SAVE
                      </>
                    )}
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