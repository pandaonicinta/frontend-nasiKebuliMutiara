import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://kebabmutiara.xyz';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    initializeCart();
  }, []);

  useEffect(() => {
    const newCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);

    if (!localStorage.getItem('auth_token')) {
      localStorage.setItem('cart', JSON.stringify(cartItems.map(item => ({
        produk_id: item.id,
        quantity: item.quantity
      }))));
    }
  }, [cartItems]);

  const initializeCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetchCartFromAPI(token);
      } else {
        loadCartFromLocalStorage();
      }
    } catch (err) {
      console.error('Error initializing cart:', err);
      setError('Failed to load cart. Please try again.');
      loadCartFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartFromAPI = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/keranjang`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.data)) {
        const formattedItems = response.data.data.map(item => ({
          id: item.id_produk,
          keranjang_id: item.keranjang_id, 
          name: item.produk.nama_produk,
          price: item.produk.harga,
          image: item.produk.gambar ? `${API_BASE_URL}/storage/${item.produk.gambar}` : null,
          quantity: item.quantity
        }));
        
        setCartItems(formattedItems);
      }
    } catch (err) {
      console.error('Error fetching cart from API:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        loadCartFromLocalStorage();
      }
      throw err;
    }
  };

  const loadCartFromLocalStorage = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (localCart.length > 0) {
        const cartWithDetails = await Promise.all(localCart.map(async (item) => {
          try {
            const response = await axios.get(`${API_BASE_URL}/api/produk/${item.produk_id}`);
            const product = response.data;
            
            return {
              id: item.produk_id,
              name: product.nama_produk,
              price: product.harga,
              image: product.gambar ? `${API_BASE_URL}/storage/${product.gambar}` : null,
              quantity: item.quantity
            };
          } catch (err) {
            console.error(`Error fetching product ${item.produk_id}:`, err);
            return {
              id: item.produk_id,
              name: 'Product',
              price: 0,
              image: null,
              quantity: item.quantity
            };
          }
        }));
        
        setCartItems(cartWithDetails);
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
      setCartItems([]);
    }
  };

  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await axios.post(
          `${API_BASE_URL}/api/keranjang/add`,
          {
            id_produk: item.id,
            quantity: item.quantity
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        await fetchCartFromAPI(token);
      } else {
        const existingItemIndex = cartItems.findIndex(
          cartItem => cartItem.id === item.id
        );
        
        if (existingItemIndex !== -1) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          setCartItems(updatedItems);
        } else {
          setCartItems([...cartItems, item]);
        }

        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemLocalIndex = existingCart.findIndex(
          cartItem => cartItem.produk_id === item.id
        );
        
        if (existingItemLocalIndex !== -1) {
          existingCart[existingItemLocalIndex].quantity += item.quantity;
        } else {
          existingCart.push({
            produk_id: item.id,
            quantity: item.quantity
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart));
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        addToCart(item);
      }
    }
  };

  const removeFromCart = async (keranjang_id) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await axios.delete(`${API_BASE_URL}/api/keranjang/delete`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            id_item: [keranjang_id] 
          }
        });
        
        await fetchCartFromAPI(token);
      } else {
        const produk_id = cartItems.find(item => item.keranjang_id === keranjang_id)?.id || keranjang_id;
        
        const updatedItems = cartItems.filter(item => item.id !== produk_id);
        setCartItems(updatedItems);
        
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = existingCart.filter(item => item.produk_id !== produk_id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      
      setSelectedItems(selectedItems.filter(id => id !== keranjang_id));
    } catch (err) {
      console.error('Error removing item from cart:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        const produk_id = cartItems.find(item => item.keranjang_id === keranjang_id)?.id || keranjang_id;
        const updatedItems = cartItems.filter(item => item.id !== produk_id);
        setCartItems(updatedItems);
      }
    }
  };

  const updateQuantity = async (keranjang_id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const cartItem = cartItems.find(item => item.keranjang_id === keranjang_id);
        if (!cartItem) return;

        await axios.delete(
          `${API_BASE_URL}/api/keranjang/delete`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: {
              id_item: [keranjang_id]
            }
          }
        );
        
        await axios.post(
          `${API_BASE_URL}/api/keranjang/add`,
          {
            id_produk: cartItem.id,
            quantity: newQuantity
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        await fetchCartFromAPI(token);
      } else {
        const cartItem = cartItems.find(item => item.keranjang_id === keranjang_id || item.id === keranjang_id);
        if (!cartItem) return;
        
        const updatedItems = cartItems.map(item => {
          if ((item.keranjang_id && item.keranjang_id === keranjang_id) || 
              (!item.keranjang_id && item.id === keranjang_id)) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        setCartItems(updatedItems);
        
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = existingCart.map(item => {
          if (item.produk_id === cartItem.id) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (err) {
      console.error('Error updating item quantity:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        updateQuantity(keranjang_id, newQuantity);
      }
    }
  };

  const toggleSelectItem = (keranjang_id) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(keranjang_id)) {
        return prevSelected.filter(id => id !== keranjang_id);
      } else {
        return [...prevSelected, keranjang_id];
      }
    });
  };

  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.keranjang_id || item.id));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.keranjang_id || item.id))
      .reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const keranjangIds = cartItems.map(item => item.keranjang_id);
        
        if (keranjangIds.length > 0) {
          await axios.delete(`${API_BASE_URL}/api/keranjang/delete`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: {
              id_item: keranjangIds
            }
          });
        }
      }
      
      setCartItems([]);
      setSelectedItems([]);
      
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Error clearing cart:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        setCartItems([]);
        setSelectedItems([]);
        localStorage.removeItem('cart');
      }
    }
  };

  const processCheckout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('User must be logged in to checkout');
      }
      
      if (selectedItems.length === 0) {
        throw new Error('No items selected for checkout');
      }
      
      // Call checkout API with selected item IDs
      const response = await axios.post(
        `${API_BASE_URL}/api/transaksi/create`, 
        {
          id_item: selectedItems
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSelectedItems([]);
      
      await fetchCartFromAPI(token);
      
      return response.data;
    } catch (err) {
      console.error('Error processing checkout:', err);
      throw err;
    }
  };

  const syncCartAfterLogin = async (token) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (localCart.length > 0) {
        for (const item of localCart) {
          await axios.post(
            `${API_BASE_URL}/api/keranjang/add`,
            {
              id_produk: item.produk_id,
              quantity: item.quantity
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      await fetchCartFromAPI(token);
      
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Error syncing cart after login:', err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoading,
        error,
        selectedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSelectItem,
        selectAllItems,
        calculateTotal,
        calculateSelectedTotal,
        clearCart,
        processCheckout,
        syncCartAfterLogin
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;