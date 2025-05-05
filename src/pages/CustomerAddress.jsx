import React, { useState, useEffect } from 'react';
import { FaUserAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';
import CustomerSidebar from './CustomerSidebar';
import aksen from '../assets/images/aksen.png';

const CustomerAddress = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Agus',
      address: 'Jln. Raya Puncak Kp. Pasanggrahan',
      district: 'Kec. Cisarua',
      postcode: '16750',
      phone: '0812312912',
      isDefault: true
    }
  ]);
  
  const [currentAddress, setCurrentAddress] = useState({
    id: null,
    name: '',
    address: '',
    district: '',
    postcode: '',
    phone: '',
    isDefault: false
  });

  const customerName = 'Agus'; // This would normally come from authentication context or localStorage

  useEffect(() => {
    // Check if user is logged in as customer
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'customer') {
      // Handle redirect or show error
    }
  }, []);

  const handleEditAddress = (address) => {
    setCurrentAddress(address);
    setIsEditing(true);
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses(addresses.filter(address => address.id !== addressId));
  };

  const handleAddNewAddress = () => {
    setCurrentAddress({
      id: Date.now(), // simple way to generate unique ID
      name: customerName,
      address: '',
      district: '',
      postcode: '',
      phone: '',
      isDefault: addresses.length === 0 // Make default if first address
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

  const handleSave = () => {
    // If this is a new address
    if (!addresses.find(addr => addr.id === currentAddress.id)) {
      setAddresses([...addresses, currentAddress]);
    } else {
      // If editing existing address
      setAddresses(addresses.map(addr => 
        addr.id === currentAddress.id ? currentAddress : addr
      ));
    }
    setIsEditing(false);
  };

  const handleBack = () => {
    setIsEditing(false);
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
      <CustomerSidebar activePage="address" />

      {/* Main Content - With proper margin to accommodate fixed sidebar */}
      <div className="relative z-10 flex-1 ml-52 mx-4 my-4 mr-6">
        {/* Header with Title and User */}
        <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-6">
          <h1 className="text-red-800 font-bold">Address</h1>
          <div className="flex items-center bg-red-800 text-white px-4 py-2 rounded-lg">
            <FaUserAlt className="mr-2 text-xs" />
            <span className="text-xs">{customerName}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg p-6">
          {!isEditing ? (
            /* Address List View */
            <>
              {addresses.map((address) => (
                <div 
                  key={address.id} 
                  className="border border-red-800 rounded-lg p-4 mb-4 relative"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{address.name}</h3>
                      <p className="text-sm">{address.address}</p>
                      <p className="text-sm">{address.phone}</p>
                      {address.isDefault && (
                        <p className="text-xs text-blue-600 mt-2">This is your default delivery address</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
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
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
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
                  <label className="block text-gray-600 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={currentAddress.name}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Address</label>
                  <textarea
                    name="address"
                    value={currentAddress.address}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3 h-32"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">District</label>
                  <input
                    type="text"
                    name="district"
                    value={currentAddress.district}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Postcode</label>
                  <input
                    type="text"
                    name="postcode"
                    value={currentAddress.postcode}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={currentAddress.phone}
                    onChange={handleInputChange}
                    className="w-full border border-red-800 rounded-lg p-3"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleBack}
                    className="border border-red-800 text-red-800 px-6 py-2 rounded-md"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-red-800 text-white px-6 py-2 rounded-md"
                  >
                    SAVE
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