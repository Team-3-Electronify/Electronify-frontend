import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getStoredToken = () => {
  const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
  for (const key of possibleTokenKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      return { token, key };
    }
  }
  return { token: null, key: null };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const { token } = getStoredToken();
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
        }
      } catch (error) {
        console.error('AuthContext initialization error:', error);

        const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        possibleTokenKeys.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('userData');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData, token, credentials = null) => {
    if (token) {

      localStorage.setItem('authToken', token);
      
      const otherTokenKeys = ['token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
      otherTokenKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
    } else {

      if (credentials) {

        const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
        localStorage.setItem('basicAuth', basicAuth);
        localStorage.setItem('authToken', `Basic ${basicAuth}`);
      }
    }
    
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setUser(userData);
    setError(null);
  };

  const logout = () => {
    setUser(null);
    
    const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
    possibleTokenKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('userData');
    localStorage.removeItem('basicAuth');
    
    setError(null);
  };

  const setLoadingState = (loading) => {
    setIsLoading(loading);
  };

  const setErrorState = (error) => {
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    isInitialized,
    login,
    logout,
    setLoadingState,
    setErrorState,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 