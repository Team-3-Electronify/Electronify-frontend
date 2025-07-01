import React from 'react';
import styles from './styles.module.css';

const RegisterPage = () => {
  return (
    <div className={styles['form-container']}>
      <form className={styles.form}>
        <h1>Register</h1>
        <div className={styles['form-group']}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" />
        </div>
        <div className={styles['form-group']}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" />
        </div>
        <button type="submit" className={styles.button}>Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
