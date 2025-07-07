import React from 'react';
import styles from './styles.module.css';

const priceRanges = [
  { id: 'all', label: 'All', min: 0, max: Infinity },
  { id: 'range1', label: 'Less than 50 €', min: 0, max: 50 },
  { id: 'range2', label: '50 € - 150 €', min: 50, max: 150 },
  { id: 'range3', label: '150 € - 300 €', min: 150, max: 300 },
  { id: 'range4', label: '300 € - 600 €', min: 300, max: 600 },
  { id: 'range5', label: '600 € - 900 €', min: 600, max: 900 },
  { id: 'range6', label: 'More than 900 €', min: 900, max: Infinity },
];

const PriceFilter = ({ onPriceChange, selectedPriceRange }) => {
  return (
    <div className={styles.priceFilter}>
      <h4>Price Range</h4>
      {priceRanges.map((range) => (
        <div key={range.id} className={styles.radioGroup}>
          <input
            type="radio"
            id={range.id}
            name="priceRange"
            checked={selectedPriceRange.id === range.id}
            onChange={() => onPriceChange(range)}
          />
          <label htmlFor={range.id}>{range.label}</label>
        </div>
      ))}
    </div>
  );
};

export default PriceFilter; 