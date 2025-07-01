import React from 'react';
import styles from './styles.module.css';

const LoginPage = () => {
  return (
    <div className={styles['form-container']}>
      <form className={styles.form}>
        <h1>Login</h1>
        <div className={styles['form-group']}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" />
        </div>
        <button type="submit" className={styles.button}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
