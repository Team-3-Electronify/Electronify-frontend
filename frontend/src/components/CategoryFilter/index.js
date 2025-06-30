import React from 'react';
import styles from './styles.module.css';

const CategoryFilter = ({ categories, onSelectCategory, selectedCategory }) => {
  return (
    <div className={styles.filterContainer}>
      <h4>Category</h4>
      <div className={styles.filterButtons}>
        <button
          onClick={() => onSelectCategory(null)}
          className={!selectedCategory ? styles.active : ''}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className={selectedCategory === category.name ? styles.active : ''}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter; 