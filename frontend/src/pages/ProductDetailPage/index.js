import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products as mockProducts } from '../../data/products';
import styles from './styles.module.css';
import ReviewForm from '../../components/ReviewForm';
import StarRating from '../../components/StarRating';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const foundProduct = mockProducts.find((p) => p.id === parseInt(id));
    setProduct(foundProduct);
  }, [id]);

  const handleReviewSubmit = (newReview) => {
    setProduct((prevProduct) => {
      const newReviewCount = prevProduct.reviewCount + 1;
      const newTotalRating = (prevProduct.rating * prevProduct.reviewCount) + newReview.rating;
      const newAverageRating = newTotalRating / newReviewCount;

      return {
        ...prevProduct,
        reviews: [
          ...prevProduct.reviews,
          {
            id: prevProduct.reviews.length + 100, // mock new id
            ...newReview,
          },
        ],
        reviewCount: newReviewCount,
        rating: newAverageRating,
      };
    });
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backLink}>&larr; Back to Products</Link>
      <div className={styles.productDetail}>
        <div className={styles.imageContainer}>
          <img src={product.imageUrl} alt={product.name} className={styles.image} />
        </div>
        <div className={styles.infoContainer}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.category}>{product.category.name}</p>
          <div className={styles.rating}>
            <StarRating rating={product.rating} />
            <span className={styles.reviewCount}>({product.reviewCount} reviews)</span>
          </div>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
          <button className={styles.button}>Add to Cart</button>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <h2>Customer Reviews</h2>
        {product.reviews.length > 0 ? (
          <ul className={styles.reviewList}>
            {product.reviews.map((review) => (
              <li key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <strong>{review.author}</strong>
                  <StarRating rating={review.rating} />
                </div>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet.</p>
        )}
        <ReviewForm onSubmit={handleReviewSubmit} />
      </div>
    </div>
  );
};

export default ProductDetailPage; 