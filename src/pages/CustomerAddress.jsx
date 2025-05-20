import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaPencilAlt, FaTrash, FaCheck, FaHome } from 'react-icons/fa';
import axios from 'axios';
import CustomerSidebar from './CustomerSidebar';
import MapPicker from "./MapPicker"
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
    latitude: '',
    longitude: '', 
    is_utama: 1 || 0
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
      console.log('asdjaksld')
      console.log(response.data)
      if (Array.isArray(response.data)) {
        addressData = response.data;
      } else if (Array.isArray(response.data.data)) {
        addressData = response.data.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        addressData = [];
      }
      console.log(addressData);
      console.log(addressData.id);
      
      const transformedAddresses = addressData.map(address => ({
        id: address.alamat_id || address.id, 
        label_alamat: address.label_alamat,
        detail: address.detail,
        kelurahan: address.kelurahan,
        kecamatan: address.kecamatan,
        kabupaten: address.kabupaten,
        provinsi: address.provinsi,
        no_telepon: address.no_telepon,
        latitude: address.latitude,
        longitude: address.longitude,
        is_utama: address.isPrimary === 1 || address.isPrimary === true || address.isPrimary === "1"
      }
    ));
      
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
          setAddresses([]);
          setError(null);
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later or contact support.');
        } else {ƒ
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

  const handleMapSelect = ({ latitude, longitude }) => {
    setCurrentAddress((prev) => ({ ...prev, latitude, longitude }));
  };

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
      
      await axios.get(`${apiUrl}/alamat/primary/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      });
      
      setError(null);
      
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_utama: addr.id === 1
      })));

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
    console.log(address.is_utama);
    console.log(address);
    console.log(address.isPrimary);
    setCurrentAddress({
      id: address.id || null,
      label_alamat: address.label_alamat || '',
      detail: address.detail || '',
      kelurahan: address.kelurahan || '',
      kecamatan: address.kecamatan || '',
      kabupaten: address.kabupaten || '',
      provinsi: address.provinsi || '',
      no_telepon: address.no_telepon || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      is_utama: address.is_utama ? 1 : 0
        });
      console.log(setCurrentAddress)
    setIsEditing(true);
  };

  const handleDeleteAddress = async (addressId, isUtama) => {
    console.log(addressId);
    console.log(isUtama);
    if(isUtama){
      window.alert('Alamat Utama tidak bisa dihapus!');
      return;
    }
    if (!addressId && addressId !== 0) {
      setError('Invalid address ID for deletion');
      window.alert('Alamat Utama tidak bisa dihapus!');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }console.log("1")
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please log in and try again.');
        return;
      }
      
      setIsLoading(true);
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
      latitude: '',
      longitude: '',
      is_utama: 1 // First address will be the primary
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
    
    setCurrentAddress((prev) => ({ ...prev, [name]: value }));
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
      
      const payload = {
        label_alamat: currentAddress.label_alamat,
        detail: currentAddress.detail,
        kelurahan: currentAddress.kelurahan || '',
        kecamatan: currentAddress.kecamatan || '', 
        kabupaten: currentAddress.kabupaten || '',
        provinsi: currentAddress.provinsi || '',
        no_telepon: currentAddress.no_telepon || '', 
        latitude: currentAddress.latitude || '', 
        longitude: currentAddress.longitude || '', 
        isPrimary: currentAddress.is_utama ? 1 : 0
      };

      console.log("patlaods", payload.isPrimary)

      if (currentAddress.id !== null && currentAddress.id !== undefined) {
        const response = await axios.post(
          `${apiUrl}/alamat/update/${currentAddress.id}`,
          payload,
          { headers }
        );
        console.log("Backend response message:", response.data.message);
        
        console.log(currentAddress.is_utama)
        if (currentAddress.is_utama === 1) {
          await axios.get(
            `${apiUrl}/alamat/primary/${currentAddress.id}`,
            { headers }
          );
        }
      } else {
        const response = await axios.post(
          `${apiUrl}/alamat/add`,
          payload,
          { headers }
        );
        
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
          <h1 className="text-red-800 font-bold">Alamat Saya</h1>
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
                          className="flex items-center justify-center px-3 h-8 rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors text-xs font-medium"
                          title="Set as primary address"
                        >
                          Atur sebagai Alamat Utama
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
                        onClick={() => handleDeleteAddress(address.id, address.is_utama)}
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
                className="w-full bg-red-800 text-white text-xs rounded-md py-3 mt-6 hover:bg-red-900 transition-colors flex items-center justify-center"
              >
                <FaHome className="mr-2" /> TAMBAH ALAMAT BARU
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-gray-600 text-sm mb-2">Pick Your Location</label>
                      <MapPicker onSelect={handleMapSelect} />
                      {currentAddress.latitude && currentAddress.longitude && (
                        <p className="text-sm text-gray-700 mt-2">
                          Selected Location: {currentAddress.latitude}, {currentAddress.longitude}
                        </p>
                      )}
                    </div>
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