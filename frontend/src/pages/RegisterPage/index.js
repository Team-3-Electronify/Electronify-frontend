import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import styles from './styles.module.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const { isLoading, error, setLoadingState, setErrorState, clearError } = useAuth();
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
    
    if (!formData.username || !formData.email || !formData.password) {
      setErrorState('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setErrorState('Password must be at least 6 characters long');
      return;
    }

    setLoadingState(true);
    clearError();

    try {
      await authAPI.register(formData);
      
      navigate('/login');
    } catch (error) {
      setErrorState(error.message || 'Registration error');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className={styles['form-container']}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Register</h1>
        
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
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            value={formData.email}
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
            minLength="6"
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
