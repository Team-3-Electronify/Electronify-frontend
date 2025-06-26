import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import logo from '../../images/logo.png';

const Header = () => {
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
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    </header>
  );
};

export default Header;
