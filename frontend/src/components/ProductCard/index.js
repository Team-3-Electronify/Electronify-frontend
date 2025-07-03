import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating';
import styles from './styles.module.css';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img src={product.imageUrl} alt={product.name} className={styles.image} />
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.rating}>
          <StarRating rating={product.rating} />
          <span className={styles.ratingValue}>
            {product.rating ? product.rating.toFixed(1) : '0.0'}
          </span>
          <span className={styles.reviewCount}>({product.reviewCount || 0})</span>
        </div>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <button className={styles.button}>View Details</button>
      </div>
    </Link>
  );
};

export default ProductCard; 