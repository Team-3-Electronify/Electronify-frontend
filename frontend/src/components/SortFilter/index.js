import React from 'react';
import styles from './styles.module.css';

const SortFilter = ({ onSortChange }) => {
  return (
    <div className={styles.sortContainer}>
      <h4>Sort By</h4>
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className={styles.sortSelect}
      >
        <option value="default">Default</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating-asc">Rating: Low to High</option>
        <option value="rating-desc">Rating: High to Low</option>
      </select>
    </div>
  );
};

export default SortFilter; 