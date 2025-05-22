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

    if (!localStorage.getItem('auth_token') && !localStorage.getItem('token') && !localStorage.getItem('authToken')) {
      localStorage.setItem('cart', JSON.stringify(cartItems.map(item => ({
        produk_id: item.id,
        quantity: item.quantity,
        ukuran: item.size 
      }))));
    }
  }, [cartItems]);

  const initializeCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
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

      console.log("API response in context:", response.data);
      
      let formattedItems = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        formattedItems = response.data.data.map(item => ({
          id: item.produk_id || item.id_produk || item.id,
          cart_item_id: item.id || item.keranjang_id,
          name: item.nama_produk || (item.produk && item.produk.nama_produk) || "Unknown Item",
          price: parseFloat(item.harga || (item.produk && item.produk.harga) || 0),
          image: getImageUrl(item.gambar || (item.produk && item.produk.gambar)),
          quantity: parseInt(item.quantity || item.jumlah || 1),
          size: item.ukuran || ''
        }));
      } else if (response.data && Array.isArray(response.data)) {
        formattedItems = response.data.map(item => ({
          id: item.produk_id || item.id_produk || item.id,
          cart_item_id: item.id || item.keranjang_id,
          name: item.nama_produk || (item.produk && item.produk.nama_produk) || "Unknown Item",
          price: parseFloat(item.harga || (item.produk && item.produk.harga) || 0),
          image: getImageUrl(item.gambar || (item.produk && item.produk.gambar)),
          quantity: parseInt(item.quantity || item.jumlah || 1),
          size: item.ukuran || ''
        }));
      }
      
      console.log("Formatted items:", formattedItems);
      setCartItems(formattedItems);
    } catch (err) {
      console.error('Error fetching cart from API:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        loadCartFromLocalStorage();
      }
      throw err;
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;  
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${API_BASE_URL}/storage/${imagePath}`;
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
              price: parseFloat(product.harga),
              image: getImageUrl(product.gambar),
              quantity: parseInt(item.quantity),
              size: item.ukuran || ''
            };
          } catch (err) {
            console.error(`Error fetching product ${item.produk_id}:`, err);
            return {
              id: item.produk_id,
              name: 'Product',
              price: 0,
              image: null,
              quantity: parseInt(item.quantity),
              size: item.ukuran || ''
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (token) {
        await axios.post(
          `${API_BASE_URL}/api/keranjang/add`,
          {
            id_produk: item.id,
            quantity: item.quantity,
            ukuran: item.size || ''
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
          cartItem => cartItem.id === item.id && cartItem.size === item.size
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
          cartItem => cartItem.produk_id === item.id && cartItem.ukuran === item.size
        );
        
        if (existingItemLocalIndex !== -1) {
          existingCart[existingItemLocalIndex].quantity += item.quantity;
        } else {
          existingCart.push({
            produk_id: item.id,
            quantity: item.quantity,
            ukuran: item.size || ''
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(existingCart));
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        addToCart(item);
      }
    }
  };

  const removeFromCart = async (id, size) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      const cartItem = cartItems.find(item => 
        item.id === id && item.size === size
      );
      
      if (!cartItem) {
        console.error('Item not found in cart');
        return;
      }
      
      if (token && cartItem.cart_item_id) {
        await axios.delete(`${API_BASE_URL}/api/keranjang/delete`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            id_item: [cartItem.cart_item_id]
          }
        });
        
        await fetchCartFromAPI(token);
      } else {
        const updatedItems = cartItems.filter(item => 
          !(item.id === id && item.size === size)
        );
        setCartItems(updatedItems);
        
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = existingCart.filter(item => 
          !(item.produk_id === id && item.ukuran === size)
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      
      setSelectedItems(selectedItems.filter(itemId => 
        itemId !== cartItem.cart_item_id
      ));
    } catch (err) {
      console.error('Error removing item from cart:', err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        removeFromCart(id, size);
      }
    }
  };

  const updateQuantity = async (productId, size, quantity) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (token) {
        await axios.post(
          `${API_BASE_URL}/api/keranjang/add`,
          {
            id_produk: productId,
            quantity: quantity,
            ukuran: size || ''
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
        const updatedItems = cartItems.map(item => {
          if (item.id === productId && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        });
        
        setCartItems(updatedItems);
        
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedLocalCart = localCart.map(item => {
          if (item.produk_id === productId && item.ukuran === size) {
            return { ...item, quantity };
          }
          return item;
        });
        
        localStorage.setItem('cart', JSON.stringify(updatedLocalCart));
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  };

  const toggleSelectItem = (cart_item_id) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(cart_item_id)) {
        return prevSelected.filter(id => id !== cart_item_id);
      } else {
        return [...prevSelected, cart_item_id];
      }
    });
  };

  const selectAllItems = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.cart_item_id || item.id));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.cart_item_id || item.id))
      .reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (token) {
        const cart_item_ids = cartItems
          .filter(item => item.cart_item_id)
          .map(item => item.cart_item_id);
        
        if (cart_item_ids.length > 0) {
          await axios.delete(`${API_BASE_URL}/api/keranjang/delete`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            data: {
              id_item: cart_item_ids
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
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        setCartItems([]);
        setSelectedItems([]);
        localStorage.removeItem('cart');
      }
    }
  };

  const processCheckout = async (addressId, paymentMethod) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('User must be logged in to checkout');
      }
      
      if (selectedItems.length === 0) {
        throw new Error('No items selected for checkout');
      }
      
      const total = calculateSelectedTotal();
      
      const response = await axios.post(
        `${API_BASE_URL}/api/transaksi/create`, 
        {
          id_item: selectedItems,
          total: total,
          id_alamat: addressId,
          jenis_pembayaran: paymentMethod 
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

  const updatePaymentStatus = async (transactionId, status) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('User must be logged in to update payment status');
      }
      
      let endpoint;
      
      switch(status) {
        case 'success':
          endpoint = `${API_BASE_URL}/api/transaksi/berhasil/${transactionId}`;
          break;
        case 'failed':
          endpoint = `${API_BASE_URL}/api/transaksi/gagal/${transactionId}`;
          break;
        default:
          throw new Error('Invalid payment status');
      }
      
      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  const getOrderStatus = async (transactionId) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('User must be logged in to check order status');
      }
      
      const response = await axios.get(
        `${API_BASE_URL}/api/transaksi/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (err) {
      console.error('Error getting order status:', err);
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
              quantity: item.quantity,
              ukuran: item.ukuran || ''
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
        updatePaymentStatus, 
        getOrderStatus, 
        syncCartAfterLogin
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;