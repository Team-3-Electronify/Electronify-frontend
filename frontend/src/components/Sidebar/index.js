import React from 'react';
import CategoryFilter from '../CategoryFilter';
import SearchFilter from '../SearchFilter';
import PriceFilter from '../PriceFilter';
import SortFilter from '../SortFilter';
import styles from './styles.module.css';

const Sidebar = ({
  categories,
  onSelectCategory,
  selectedCategory,
  onSearchChange,
  onPriceChange,
  selectedPriceRange,
  onSortChange,
}) => {
  return (
    <aside className={styles.sidebar}>
      <SearchFilter onSearchChange={onSearchChange} />
      <SortFilter onSortChange={onSortChange} />
      <PriceFilter
        onPriceChange={onPriceChange}
        selectedPriceRange={selectedPriceRange}
      />
      <CategoryFilter
        categories={categories}
        onSelectCategory={onSelectCategory}
        selectedCategory={selectedCategory}
      />
    </aside>
  );
};

export default Sidebar; 