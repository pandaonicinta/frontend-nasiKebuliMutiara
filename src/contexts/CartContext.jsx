import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const CartContext = createContext();

// Sample dummy data to match the UI in the image
const dummyOrders = [
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' },
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'ON DELIVERY' },
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'NEW ORDER' },
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' },
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'DELIVERED' },
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'NEW ORDER' },
  { id: '#123123', date: '1 January 2025, 12:00AM', customerName: 'Agus', amount: 'Rp. 90.000', status: 'ON DELIVERY' }
];

export const CartProvider = ({ children }) => {
  // Retrieve cart items from localStorage on initial load
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  
  // Cart count state
  const [cartCount, setCartCount] = useState(0);
  
  // Update cart count whenever cartItems changes
  useEffect(() => {
    // Calculate total items in cart
    const newCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (item) => {
    // Check if item already exists in cart with the same size
    const existingItemIndex = cartItems.findIndex(
      cartItem => cartItem.id === item.id && cartItem.size === item.size
    );
    
    if (existingItemIndex !== -1) {
      // If item exists, update quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setCartItems(updatedItems);
    } else {
      // If item doesn't exist, add new item
      setCartItems([...cartItems, item]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (id, size) => {
    const updatedItems = cartItems.filter(
      item => !(item.id === id && item.size === size)
    );
    setCartItems(updatedItems);
  };
  
  // Update item quantity
  const updateQuantity = (id, size, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => {
      if (item.id === id && item.size === size) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedItems);
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // Extract numeric value from price string (e.g., "Rp. 20.000" -> 20000)
      const itemPrice = parseInt(item.price.replace('Rp. ', '').replace(/\./g, ''));
      return total + (itemPrice * item.quantity);
    }, 0);
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        cartCount, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        calculateTotal,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};