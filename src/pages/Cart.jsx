import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight, HiOutlineArrowNarrowLeft } from 'react-icons/hi';
import { CartContext } from '../contexts/CartContext';
import logo from '../assets/images/logo.png';

const formatPrice = (price) => {
  // Format as Rp. XX.XXX
  return `Rp. ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, calculateTotal, cartCount, clearCart } = useContext(CartContext);
  
  // State for selected items
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Calculate shipping cost (10.000)
  const shippingCost = 10000;
  
  // Initialize selected items when cart changes
  useEffect(() => {
    const initialSelected = {};
    cartItems.forEach(item => {
      const itemKey = `${item.id}-${item.size}`;
      // Preserve selection if item existed, default to true for new items
      initialSelected[itemKey] = selectedItems[itemKey] !== undefined ? selectedItems[itemKey] : true;
    });
    setSelectedItems(initialSelected);
    
    // Check if all items are selected to update selectAll state
    const allSelected = cartItems.length > 0 && 
      Object.values(initialSelected).every(value => value === true);
    setSelectAll(allSelected);
  }, [cartItems]);
  
  // Calculate subtotal of selected items
  const calculateSelectedSubtotal = () => {
    return cartItems.reduce((total, item) => {
      console.log(item);
      const itemKey = `${item.id}-${item.size}`;
      const itemPrice = item.price;
      
      if (selectedItems[itemKey]) {
        return total + (itemPrice * item.quantity);
      }
      return total;
    }, 0);
  };
  
  // Get selected items count - include quantity of each item
  const getSelectedCount = () => {
    return cartItems.reduce((count, item) => {
      const itemKey = `${item.id}-${item.size}`;
      return count + (selectedItems[itemKey] ? item.quantity : 0);
    }, 0);
  };
  
  // Get total quantity of all items
  const getTotalQuantity = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Calculate subtotal and total
  const subtotal = calculateSelectedSubtotal();
  const total = subtotal + (getSelectedCount() > 0 ? shippingCost : 0);
  
  // Handle quantity change
  const handleQuantityChange = (itemId, size, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, size, newQuantity);
    }
  };
  
  // Handle item selection
  const toggleItemSelection = (itemId, size) => {
    const itemKey = `${itemId}-${size}`;
    const newSelectedItems = {
      ...selectedItems,
      [itemKey]: !selectedItems[itemKey]
    };
    setSelectedItems(newSelectedItems);
    
    // Update selectAll state
    const allSelected = cartItems.length > 0 && 
      cartItems.every(item => newSelectedItems[`${item.id}-${item.size}`]);
    setSelectAll(allSelected);
  };
  
  // Handle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    // Update all item selections
    const newSelectedItems = {};
    cartItems.forEach(item => {
      newSelectedItems[`${item.id}-${item.size}`] = newSelectAll;
    });
    setSelectedItems(newSelectedItems);
  };
  
  // Handle proceed to checkout - only for selected items
  const handleCheckout = () => {
    // Check if any item is selected
    if (getSelectedCount() === 0) {
      alert('Please select at least one item to checkout');
      return;
    }
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <header className="bg-white py-4 px-4 md:px-8 lg:px-12 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <img 
              src={logo} 
              alt="Nasi Kebuli Mutiara" 
              className="h-12 cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-800 hover:text-[#FDC302] font-medium">Home</a>
            <a href="/about" className="text-gray-800 hover:text-[#FDC302] font-medium">About Us</a>
            <a href="/menu" className="text-gray-800 hover:text-[#FDC302] font-medium">Menu</a>
            <button className="text-gray-800 hover:text-[#FDC302]">
              <FiSearch size={20} />
            </button>
            <a href="/cart" className="text-[#FDC302] relative">
              <FiShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 bg-[#FDC302] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600">({cartCount} {cartCount === 1 ? 'Item' : 'Items'})</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            {cartItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FiShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-6">Your cart is empty</p>
                <button 
                  onClick={() => navigate('/menu')}
                  className="bg-[#FDC302] text-white py-3 px-6 rounded-md hover:bg-yellow-500 transition duration-300 flex items-center mx-auto"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Select All Checkbox - Fixed Alignment */}
                <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-[#FDC302] focus:ring-[#FDC302] rounded border-gray-300"
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-700">
                      Select All Items ({cartCount})
                    </label>
                  </div>
                  <span className="ml-auto text-sm text-gray-500">
                    {getSelectedCount()} of {getTotalQuantity()} selected
                  </span>
                </div>
                
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-2 mb-4 pb-2 border-b">
                  <div className="col-span-1 flex items-center justify-center"></div>
                  <div className="col-span-4 font-semibold">Product Details</div>
                  <div className="col-span-2 font-semibold">Price</div>
                  <div className="col-span-2 font-semibold">Quantity</div>
                  <div className="col-span-3 font-semibold">Total</div>
                </div>
                
                {/* Cart Items */}
                <div className="max-h-[450px] overflow-y-auto pr-2">
                  {cartItems.map((item) => {
                    // Calculate item total
                    const itemPrice = item.price;
                    const itemTotal = itemPrice * item.quantity;
                    const itemKey = `${item.id}-${item.size}`;
                    
                    return (
                      <div key={itemKey} className="grid md:grid-cols-12 gap-2 py-4 border-b items-center">
                        {/* Checkbox - Improved Alignment */}
                        <div className="col-span-1 flex items-center justify-center">
                          <input
                            type="checkbox"
                            id={`select-${itemKey}`}
                            checked={selectedItems[itemKey] || false}
                            onChange={() => toggleItemSelection(item.id, item.size)}
                            className="w-4 h-4 text-[#FDC302] focus:ring-[#FDC302] rounded border-gray-300"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="col-span-4 flex gap-3">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                          <div className="pr-2">
                            <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500">Size: {item.size}</p>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="col-span-2 text-gray-700 text-sm">{item.price}</div>
                        
                        {/* Quantity */}
                        <div className="col-span-2">
                          <div className="flex items-center border border-gray-300 rounded-md w-24">
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-2 py-1 text-center flex-1">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {/* Total and Remove Button - Changed to Trash Icon */}
                        <div className="col-span-3 flex items-center justify-between">
                          <span className="font-medium text-sm">{formatPrice(itemTotal)}</span>
                          <button 
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-red-500 hover:text-red-700 bg-gray-100 p-2 rounded-full"
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Action Buttons - Added backgrounds */}
                <div className="mt-8 flex justify-between">
                  <button 
                    onClick={() => navigate('/menu')}
                    className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition duration-300"
                  >
                    <HiOutlineArrowNarrowLeft className="mr-2" /> Continue Shopping
                  </button>
                  
                  <button 
                    onClick={() => clearCart()}
                    className="flex items-center bg-red-100 text-red-600 py-2 px-4 rounded-md hover:bg-red-200 transition duration-300"
                  >
                    <FiTrash2 className="mr-2" /> Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold mb-4 text-center">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="border-b pb-3">
                  <h3 className="font-medium mb-2 text-sm">Selected Products:</h3>
                  {cartItems.map((item) => {
                    const itemKey = `${item.id}-${item.size}`;
                    if (selectedItems[itemKey]) {
                      return (
                        <div key={`summary-${itemKey}`} className="flex justify-between text-gray-700 mb-1 text-xs">
                          <span className="truncate max-w-[150px]">{item.name} ({item.size}) x{item.quantity}</span>
                          <span>{item.price}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  {getSelectedCount() === 0 && (
                    <div className="text-gray-500 text-xs italic">No items selected</div>
                  )}
                </div>
                
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-700">Sub Total</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between py-1 border-b pb-3 text-sm">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-medium">
                    {getSelectedCount() > 0 ? formatPrice(shippingCost) : 'Rp. 0'}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 font-bold">
                  <span>Total</span>
                  <span className="text-red-700">{formatPrice(total)}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                disabled={getSelectedCount() === 0}
                className={`w-full py-3 px-4 bg-[#FDC302] text-white rounded-md flex items-center justify-center transition duration-300 ${
                  getSelectedCount() === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-500'
                }`}
              >
                Checkout Selected Items ({getSelectedCount()}) <HiOutlineArrowNarrowRight className="ml-2" />
              </button>
              
              {/* Security Note */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Safe and Secure Payments. Easy Returns.
                </div>
                <p>100% Authentic Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer*/}
      <footer className="bg-red-900 text-white py-8 px-6 md:px-20 lg:px-32">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <img src={logo} alt="Kebuli Mutiara" className="h-14 mb-2" />
            </div>
            <div className="lg:col-span-1">
              <h3 className="text-base font-semibold mb-4">Navigation</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Shop
                    </a>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Products
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-yellow-400 flex items-center text-xs">
                      <span className="text-yellow-400 mr-2">•</span>
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
  
            {/* Address */}
            <div className="lg:col-span-1">
              <div className="flex items-start mb-3">
                <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-xs">Address:</h4>
                  <p className="text-xs">
                    Jl. Villa Mutiara Cikarang blok H10, No.37, Ciantra, Cikarang Sel. Kab. Bekasi, Jawa Barat 17530
                  </p>
                </div>
              </div>
  
              <div className="flex items-start">
                <div className="bg-red-800 p-1.5 rounded-full mr-2 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-xs">Email:</h4>
                  <p className="text-xs">mutiara@gmail.com</p>
                </div>
              </div>
            </div>
  
            {/* Phone */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="bg-red-800 p-1.5 rounded-full mr-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold">+62 897-9792-939</h4>
                  <p className="text-xs">Got Questions? Call us 24/7</p>
                </div>
              </div>
  
              {/*Social Media */}
              <div className="flex justify-end space-x-3 mt-4">
                <a href="#" className="bg-red-800 p-1.5 rounded-md hover:bg-red-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="bg-red-800 p-1.5 rounded-md hover:bg-red-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.644.069 3.204 2.163 7.298 2.163 4.095 0 4.559-.012 4.85-.07 4.915-.188 6.445-1.718 6.633-6.632.058-1.29.07-1.752.07-4.85 0-3.098-.013-3.559-.07-4.849-.188-4.92-1.724-6.454-6.633-6.632-1.29-.058-1.752-.07-4.85-.07zm0 2.16c3.203 0 3.585.016 4.85.071 2.802.128 4.049 1.393 4.176 4.175.055 1.265.07 1.644.07 4.849 0 3.205-.015 3.586-.07 4.85-.127 2.783-1.374 4.048-4.176 4.176-1.265.055-1.647.07-4.85.07-3.201 0-3.584-.015-4.848-.07-2.802-.128-4.049-1.393-4.176-4.176-.055-1.264-.07-1.645-.07-4.85 0-3.205.015-3.584.07-4.849.127-2.783 1.374-4.048 4.176-4.175 1.264-.055 1.646-.07 4.848-.07zm0 3.676a5.16 5.16 0 100 10.32 5.16 5.16 0 000-10.32zm0 8.486a3.326 3.326 0 110-6.652 3.326 3.326 0 010 6.652zm6.532-8.694a1.206 1.206 0 11-2.413 0 1.206 1.206 0 012.413 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
  
      {/* Copyright Section */}
      <div className="bg-red-900 text-white text-center py-3 px-6 md:px-20 lg:px-32">
        <div className="w-full h-px bg-red-800 mb-4"></div> 
        <div className="p-0 mt-0"></div>
        <div className="container mx-auto">
          <p className="text-xs">Copyright © 2025 Kebuli Mutiara. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;