import React from 'react';
import styles from './styles.module.css';

const SearchFilter = ({ onSearchChange }) => {
  return (
    <div className={styles.searchContainer}>
      <h4>Search by Name</h4>
      <input
        type="text"
        placeholder="e.g., Laptop Pro"
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchFilter; 