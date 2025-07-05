const BASE_URL = 'http://localhost:8080';

const getAuthToken = () => {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    return authToken;
  }
  
  const basicAuth = localStorage.getItem('basicAuth');
  if (basicAuth) {
    return `Basic ${basicAuth}`;
  }
  
  const possibleTokenKeys = ['token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
  for (const key of possibleTokenKeys) {
    const token = localStorage.getItem(key);
    if (token) {
      return token;
    }
  }
  
  return null;
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': token.startsWith('Basic ') ? token : `Bearer ${token}` }),   
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
      possibleTokenKeys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('userData');
      localStorage.removeItem('basicAuth');
      
      throw new Error('Please login to perform this action');
    }
    
    if (response.status === 204) {
      return [];
    }
    
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      
      if (response.status === 404 || text.includes('no results') || text.includes('not found')) {
        return [];
      }
      
      throw new Error(`Server returned non-JSON response (status: ${response.status})`);
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404 || (data.message && data.message.includes('not found'))) {
        return [];
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
    
  } catch (error) {
    if (error instanceof SyntaxError || error.name === 'SyntaxError') {
      return [];
    }
    
    if (!error.message.includes('Authentication required') && 
        !error.message.includes('Please login') && 
        !error.message.includes('404')) {
      console.error('API Request Error:', error);
    }
    throw error;
  }
};

export const authAPI = {
  register: async (userData) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response;
  },

  login: async (credentials) => {
    
    const url = `${BASE_URL}/api/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    for (let [key, value] of response.headers.entries()) {
      if (key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('jwt') ||
          key.toLowerCase().includes('bearer')) {
        localStorage.setItem('authToken', value);
      }
    }

    const data = await response.json();
    
    return data;
  },
};

export const productsAPI = {
  getAllProducts: async () => {
    try {
      const result = await apiRequest('/api/products');
      const products = Array.isArray(result) ? result : [];
      
      const productsWithReviewCount = [];
      const batchSize = 3;
      
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (product) => {
            try {
              const reviews = await reviewsAPI.getReviewsByProduct(product.id);
              const reviewCount = reviews.length;
              const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
              const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
              
              return {
                ...product,
                reviewCount,
                rating: averageRating || product.rating || 0
              };
            } catch (error) {
              return {
                ...product,
                reviewCount: product.reviewCount || 0,
                rating: product.rating || 0
              };
            }
          })
        );
        productsWithReviewCount.push(...batchResults);
      }
      
      return productsWithReviewCount;
    } catch (error) {
      console.error('Failed to get all products:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    return apiRequest(`/api/products/${encodeURIComponent(id)}`);
  },

  getFilteredProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.name && filters.name.trim()) {
      params.append('name', filters.name.trim());
    }
    
    if (filters.categoryId) {
      params.append('categoryId', String(filters.categoryId));
    }
    
    if (filters.priceGroup) {
      params.append('priceGroup', filters.priceGroup);
    }
    
    if (filters.sortByPrice && ['asc', 'desc'].includes(filters.sortByPrice)) {
      params.append('sortByPrice', filters.sortByPrice);
    }
    
    if (filters.sortByRating && ['asc', 'desc'].includes(filters.sortByRating)) {
      params.append('sortByRating', filters.sortByRating);
    }

        const queryString = params.toString();
    const endpoint = queryString ? `/api/products/filter?${queryString}` : '/api/products/filter';
    
          try {
        const result = await apiRequest(endpoint);
        const products = Array.isArray(result) ? result : [];
        
        const productsWithReviewCount = [];
        const batchSize = 3;
        
        for (let i = 0; i < products.length; i += batchSize) {
          const batch = products.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(async (product) => {
              try {
                const reviews = await reviewsAPI.getReviewsByProduct(product.id);
                const reviewCount = reviews.length;
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
                
                return {
                  ...product,
                  reviewCount,
                  rating: averageRating || product.rating || 0
                };
              } catch (error) {
                return {
                  ...product,
                  reviewCount: product.reviewCount || 0,
                  rating: product.rating || 0
                };
              }
            })
          );
          productsWithReviewCount.push(...batchResults);
        }
        
        return productsWithReviewCount;
    } catch (error) {
      console.error('Failed to get filtered products:', error);
      throw error;
    }
  },
};

export const reviewsAPI = {
  getReviewsByProduct: async (productId) => {
    try {
      const result = await apiRequest(`/api/reviews/byProduct?productId=${encodeURIComponent(productId)}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {

      return [];
    }
  },

  createReview: async (reviewData) => {
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
      throw new Error('You must be logged in to create a review. Please login again.');
    }
    
    try {
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        if (token.startsWith('Basic ')) {
          headers['Authorization'] = token;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          rating: reviewData.rating,
          body: reviewData.body,
          productId: reviewData.productId
        })
      });
      
      if (response.status === 401) {  
        localStorage.removeItem('userData');
        localStorage.removeItem('basicAuth');
        const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        possibleTokenKeys.forEach(key => localStorage.removeItem(key));
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {

      throw error;
    }
  },
};

export const cartAPI = {
  getCart: async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Authentication required');
      }
      
      return await apiRequest('/api/cart');
    } catch (error) {
      if (!error.message.includes('Authentication required') && 
          !error.message.includes('Please login') && 
          !error.message.includes('404')) {
        console.error('Failed to get cart:', error);
      }
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Authentication required');
      }
      
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        if (token.startsWith('Basic ')) {
          headers['Authorization'] = token;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          productId: productId,
          quantity: quantity
        })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('userData');
        localStorage.removeItem('basicAuth');
        const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        possibleTokenKeys.forEach(key => localStorage.removeItem(key));
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      if (!error.message.includes('Authentication required') && 
          !error.message.includes('Please login') && 
          !error.message.includes('404')) {
        console.error('Failed to add to cart:', error);
      }
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Authentication required');
      }
      
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        if (token.startsWith('Basic ')) {
          headers['Authorization'] = token;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${BASE_URL}/api/cart/update`, {
        method: 'PUT',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          productId: productId,
          quantity: quantity
        })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('userData');
        localStorage.removeItem('basicAuth');
        const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        possibleTokenKeys.forEach(key => localStorage.removeItem(key));
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      if (!error.message.includes('Authentication required') && 
          !error.message.includes('Please login') && 
          !error.message.includes('404')) {
        console.error('Failed to update cart item:', error);
      }
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Authentication required');
      }
      
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        if (token.startsWith('Basic ')) {
          headers['Authorization'] = token;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${BASE_URL}/api/cart/remove`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          productId: productId
        })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('userData');
        localStorage.removeItem('basicAuth');
        const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        possibleTokenKeys.forEach(key => localStorage.removeItem(key));
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      if (!error.message.includes('Authentication required') && 
          !error.message.includes('Please login') && 
          !error.message.includes('404')) {
        console.error('Failed to remove from cart:', error);
      }
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        throw new Error('Authentication required');
      }
      
      const token = getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        if (token.startsWith('Basic ')) {
          headers['Authorization'] = token;
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch(`${BASE_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });
      
      if (response.status === 401) {
        localStorage.removeItem('userData');
        localStorage.removeItem('basicAuth');
        const possibleTokenKeys = ['authToken', 'token', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        possibleTokenKeys.forEach(key => localStorage.removeItem(key));
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      if (!error.message.includes('Authentication required') && 
          !error.message.includes('Please login') && 
          !error.message.includes('404')) {
        console.error('Failed to clear cart:', error);
      }
      throw error;
    }
  },
};

export default apiRequest; 