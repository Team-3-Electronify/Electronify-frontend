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
      ...(token && { 'Authorization': `Bearer ${token}` }),   
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
    
    console.error('API Request Error:', error);
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
      return Array.isArray(result) ? result : [];
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
    
    console.log('API Request URL:', `${BASE_URL}${endpoint}`);
    
    try {
      const result = await apiRequest(endpoint);
      return Array.isArray(result) ? result : [];
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
      console.error('Failed to get reviews:', error);
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
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Review creation error:', error);
      throw error;
    }
  },
};

export default apiRequest; 