import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  const [isOfflineMode] = useState(true); 

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
  }, []);



  useEffect(() => {
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
        setCartItems([]);
      }
    };
    
    loadLocalCart();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

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
    addToLocalCart(product, quantity);
  }, [addToLocalCart]);

  const removeFromCart = async (productId) => {
    removeFromLocalCart(productId);
  };

  const removeFromLocalCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    updateLocalQuantity(productId, newQuantity);
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
    setCartItems([]);
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
    isOfflineMode,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartStats,
    isInCart,
    getProductQuantity,
    setIsLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 