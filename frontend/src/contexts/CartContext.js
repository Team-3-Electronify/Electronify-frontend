import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI, productsAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const userData = localStorage.getItem('userData');
      const nowAuthenticated = !!userData;
      
      setIsAuthenticated(nowAuthenticated);
    };
    
    checkAuthStatus();
    
    const handleStorageChange = (event) => {
      if (event.key === 'userData') {
        checkAuthStatus();
      }
    };
    
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isAuthenticated]);

  const convertServerCartToLocal = useCallback(async (serverCart) => {
    if (!serverCart || !serverCart.items || serverCart.items.length === 0) {
      return [];
    }
    
    try {
      const cartItems = await Promise.all(
        serverCart.items.map(async (item) => {
          try {
            const product = await productsAPI.getProductById(item.productId);
            return {
              ...product,
              id: item.productId,
              quantity: item.quantity
            };
          } catch (error) {
            console.error(`Error loading product ${item.productId}:`, error);
            return {
              id: item.productId,
              name: item.name || 'Unknown Product',
              price: item.price || 0,
              quantity: item.quantity,
              imageUrl: '',
              category: { name: 'Unknown' }
            };
          }
        })
      );
      
      return cartItems;
    } catch (error) {
      console.error('Error converting server cart:', error);
      return [];
    }
  }, []);

  const syncCartWithServer = useCallback(async (localCartItems) => {
    if (!isAuthenticated || localCartItems.length === 0) return;
    
    try {
      setIsLoading(true);
      
      for (const item of localCartItems) {
        await cartAPI.addToCart(item.id, item.quantity);
      }
      
      localStorage.removeItem('cartItems');
      
      const serverCart = await cartAPI.getCart();
      const convertedItems = await convertServerCartToLocal(serverCart);
      setCartItems(convertedItems);
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, convertServerCartToLocal]);

  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        const localCartItems = getLocalCartItems();
        
        try {
          setIsLoading(true);

          if (localCartItems.length > 0) {
            await syncCartWithServer(localCartItems);
          } else {
            const serverCart = await cartAPI.getCart();
            
            const convertedItems = await convertServerCartToLocal(serverCart);
            setCartItems(convertedItems);
          }
        } catch (error) {
          console.error('Error loading cart from server:', error);
          loadLocalCart();
        } finally {
          setIsLoading(false);
        }
      } else {
        loadLocalCart();
      }
    };
    
    const loadLocalCart = () => {
      try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    };
    
    const getLocalCartItems = () => {
      try {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        console.error('Error getting local cart items:', error);
        return [];
      }
    };
    
    loadCart();
  }, [isAuthenticated, syncCartWithServer, convertServerCartToLocal]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isAuthenticated]);

  const addToLocalCart = useCallback((product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  }, []);

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const updatedCart = await cartAPI.addToCart(product.id, quantity);
        
        const convertedItems = await convertServerCartToLocal(updatedCart);
        setCartItems(convertedItems);
      } catch (error) {
        console.error('Error adding to cart:', error);
        addToLocalCart(product, quantity);
      } finally {
        setIsLoading(false);
      }
    } else {
      addToLocalCart(product, quantity);
    }
  }, [isAuthenticated, convertServerCartToLocal, addToLocalCart]);

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        await cartAPI.removeFromCart(productId);
        
        const serverCart = await cartAPI.getCart();
        const convertedItems = await convertServerCartToLocal(serverCart);
        setCartItems(convertedItems);
      } catch (error) {
        console.error('Error removing from cart:', error);  
        removeFromLocalCart(productId);
      } finally {
        setIsLoading(false);
      }
    } else {
      removeFromLocalCart(productId);
    }
  };

  const removeFromLocalCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const updatedCart = await cartAPI.updateCartItem(productId, newQuantity);
        
        const convertedItems = await convertServerCartToLocal(updatedCart);
        setCartItems(convertedItems);
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        updateLocalQuantity(productId, newQuantity);
      } finally {
        setIsLoading(false);
      }
    } else {
      updateLocalQuantity(productId, newQuantity);
    }
  };

  const updateLocalQuantity = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        await cartAPI.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCartItems([]);
    }
  };

  const getCartStats = () => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      totalItems,
      totalPrice,
      itemCount: cartItems.length
    };
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const getProductQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    isLoading,
    isAuthenticated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartStats,
    isInCart,
    getProductQuantity,
    syncCartWithServer,
    setIsLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 