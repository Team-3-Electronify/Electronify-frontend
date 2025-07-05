import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const fromState = location.state;
  const successMessage = fromState?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });


      if (response.authenticated === false) {
        throw new Error(response.message || 'Invalid username or password');
      }

      let userData = null;
      let token = null;

      if (response.user && response.token) {
        userData = response.user;
        token = response.token;
      } 
      else if (response.user && response.accessToken) {
        userData = response.user;
        token = response.accessToken;
      }
      else if (response.user && response.auth_token) {
        userData = response.user;
        token = response.auth_token;
      }
      else if (response.token && (response.id || response.username)) {
        userData = {
          id: response.id,
          username: response.username || formData.username,
          email: response.email,
          name: response.name
        };
        token = response.token;
      } 
      else if (response.accessToken && (response.id || response.username)) {
        userData = {
          id: response.id,
          username: response.username || formData.username,
          email: response.email,
          name: response.name
        };
        token = response.accessToken;
      }
      else if (response.token) {
        userData = {
          username: formData.username,
          email: response.email || ''
        };
        token = response.token;
      } 
      else if (response.accessToken) {
        userData = {
          username: formData.username,
          email: response.email || ''
        };
        token = response.accessToken;
      }
      else if (response.user) {
        userData = response.user;
        token = null;
      } 
      else if (response.username && response.token) {
        userData = response;
        token = response.token;
      }
      else {
        const possibleTokenFields = ['token', 'accessToken', 'access_token', 'authToken', 'auth_token', 'jwt', 'bearerToken'];
        for (const field of possibleTokenFields) {
          if (response[field]) {
            token = response[field];
            break;
          }
        }

        if (response.username || response.email || response.id) {
          userData = {
            id: response.id,
            username: response.username || formData.username,
            email: response.email,
            name: response.name || response.displayName || response.fullName
          };
        } else {
          userData = {
            username: formData.username,
            email: response.email || ''
          };
        }
      }

      if (!token) {
        const possibleTokenKeys = ['token', 'authToken', 'accessToken', 'auth_token', 'jwt', 'bearerToken'];
        for (const key of possibleTokenKeys) {
          const storedToken = localStorage.getItem(key);
          if (storedToken) {
            token = storedToken;
            break;
          }
        }
      }

      if (!userData) {
        throw new Error('No user data could be extracted from server response');
      }

      await login(userData, token, {
        username: formData.username,
        password: formData.password
      });

      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      if (redirectAfterLogin) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectAfterLogin, { replace: true });
      } else if (fromState?.from && fromState.from !== '/login') {
        navigate(fromState.from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      
    } catch (err) {

      const isAuthError = err.message && (
        err.message.includes('Invalid username or password') ||
        err.message.includes('Invalid credentials') ||
        err.message.includes('Authentication failed')
      );
      
      if (!isAuthError) {
        console.error('LoginPage: Login error:', err);
      }
      
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginForm}>
        <h2>Login to Your Account</h2>
        
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        
        {fromState?.productName && (
          <div className={styles.returnInfo}>
            You'll be returned to <strong>{fromState.productName}</strong> after login
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className={styles.links}>
          <Link 
            to="/register" 
            state={fromState}
            className={styles.link}
          >
            Don't have an account? Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
