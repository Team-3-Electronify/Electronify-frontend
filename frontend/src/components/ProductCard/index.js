import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        <img src={product.imageUrl} alt={product.name} className={styles.image} />
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <button className={styles.button}>View Details</button>
      </div>
    </Link>
  );
};

export default ProductCard; 