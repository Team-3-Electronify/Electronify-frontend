import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './styles.module.css';
import logo from '../../../images/logo.png';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={logo} alt="Electronify" />
          <h1>Electronify</h1>
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        
        {isAuthenticated ? (
          <div className={styles.userSection}>
            <span className={styles.welcome}>
              Hello, {user?.username || user?.email}!
            </span>
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
