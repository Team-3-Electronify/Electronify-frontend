import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import styles from './styles.module.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { login, isLoading, error, setLoadingState, setErrorState, clearError } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setErrorState('Please fill in all fields');
      return;
    }

    setLoadingState(true);
    clearError();

    try {
      const response = await authAPI.login(formData);
      
      await login(response.user, response.token);
      
      navigate('/');
    } catch (error) {
      setErrorState(error.message || 'Login error');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className={styles['form-container']}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Login</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <div className={styles['form-group']}>
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className={styles['form-group']}>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
