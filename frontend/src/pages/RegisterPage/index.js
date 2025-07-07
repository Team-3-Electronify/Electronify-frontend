import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const fromState = location.state;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const extractUserAndToken = (response) => {
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
        email: response.email || formData.email,
        name: response.name
      };
      token = response.token;
    } 
    else if (response.accessToken && (response.id || response.username)) {
      userData = {
        id: response.id,
        username: response.username || formData.username,
        email: response.email || formData.email,
        name: response.name
      };
      token = response.accessToken;
    }
    else if (response.token) {
      userData = {
        username: formData.username,
        email: formData.email
      };
      token = response.token;
    } 
    else if (response.accessToken) {
      userData = {
        username: formData.username,
        email: formData.email
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
          email: response.email || formData.email,
          name: response.name || response.displayName || response.fullName
        };
      } else {
        userData = {
          username: formData.username,
          email: formData.email
        };
      }
    }

    return { userData, token };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await authAPI.register(registrationData);

      const { userData, token } = extractUserAndToken(response);

      if (userData) {
        await login(userData, token, { username: formData.username, password: formData.password });
        
        if (fromState?.from && fromState.from !== '/register') {
          navigate(fromState.from, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        try {
          const loginResponse = await authAPI.login({
            username: formData.username,
            password: formData.password,
          });

          const { userData: loginUserData, token: loginToken } = extractUserAndToken(loginResponse);

          if (loginUserData) {
            await login(loginUserData, loginToken, { username: formData.username, password: formData.password });
            
            if (fromState?.from && fromState.from !== '/register') {
              navigate(fromState.from, { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            throw new Error('Login after registration failed');
          }
        } catch (loginError) {
          navigate('/login', { 
            state: { 
              ...fromState,
              message: 'Registration successful! Please login with your credentials.' 
            }
          });
        }
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.registerForm}>
        <h2>Create Your Account</h2>
        
        {fromState?.productName && (
          <div className={styles.returnInfo}>
            You'll be returned to <strong>{fromState.productName}</strong> after registration
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
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
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
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className={styles.links}>
          <Link 
            to="/login" 
            state={fromState}
            className={styles.link}
          >
            Already have an account? Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
