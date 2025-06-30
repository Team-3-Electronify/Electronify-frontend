import React from 'react';
import styles from './styles.module.css';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0; // This can be used later for half-star icons
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={styles.starRating}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={styles.starFilled}>★</span>
      ))}
      {/* Half star logic can be added here if you have a half-star icon */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className={styles.star}>★</span>
      ))}
    </div>
  );
};

export default StarRating; 