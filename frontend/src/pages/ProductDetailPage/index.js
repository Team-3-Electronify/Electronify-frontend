import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import styles from './styles.module.css';
import ReviewForm from '../../components/ReviewForm';
import StarRating from '../../components/StarRating';

const ProductDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isInitialized } = useAuth();
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productsAPI.getProductById(id);
        setProduct(productData);
      } catch (err) {
        setError(err.message || 'Failed to load product');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const reviewsData = await reviewsAPI.getReviewsByProduct(id);
        
        const reviewsWithAuthor = (reviewsData || []).map(review => ({
          ...review,
          author: review.authorName || review.author || 'Anonymous User'
        }));
        
        setReviews(reviewsWithAuthor);
      } catch (err) {
        setReviewsError(err.message || 'Failed to load reviews');
        console.error('Error loading reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id && isInitialized) {
      loadProduct();
      loadReviews();
    }
  }, [id, isInitialized]);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product);
      setAddToCartSuccess(true);
      
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleReviewSubmit = async (newReview) => {
    if (!user) {
      setSubmitError('Please login to submit a review');
      return;
    }

    try {
      setSubmittingReview(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      const reviewData = {
        rating: newReview.rating,
        body: newReview.comment,
        productId: parseInt(id),
        userId: user.id
      };

      const createdReview = await reviewsAPI.createReview(reviewData);
      
      const reviewWithUser = {
        ...createdReview,
        author: user.username || user.name || user.email || 'Anonymous',
        authorName: user.username || user.name || user.email || 'Anonymous',
        comment: createdReview.body || createdReview.comment
      };
      
      setReviews(prevReviews => [...prevReviews, reviewWithUser]);
      
      setProduct(prevProduct => {
        const allReviews = [...reviews, reviewWithUser];
        const newReviewCount = allReviews.length;
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const newAverageRating = newReviewCount > 0 ? totalRating / newReviewCount : 0;

        return {
          ...prevProduct,
          reviewCount: newReviewCount,
          rating: newAverageRating,
        };
      });
      
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      
      if (err.message.includes('login')) {
        logout();
        setSubmitError('Your session has expired. Please login again to submit a review.');
      } else {
        setSubmitError(err.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const actualReviewCount = reviews.length;
  const actualRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : (product?.rating || 0);

  if (!isInitialized || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Error: {error}</p>
          <Link to="/" className={styles.backLink}>← Back to Products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Product not found</p>
          <Link to="/" className={styles.backLink}>← Back to Products</Link>
        </div>
      </div>
    );
  }

  const returnToProductState = {
    from: location.pathname,
    productId: id,
    productName: product.name
  };

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
            <StarRating rating={actualRating} />
            <span className={styles.ratingValue}>
              {actualRating ? actualRating.toFixed(1) : '0.0'}
            </span>
            <span className={styles.reviewCount}>({actualReviewCount} reviews)</span>
          </div>
          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
          <p className={styles.price}>${product.price.toFixed(2)}</p>
          <div className={styles.cartSection}>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.button}
                onClick={handleAddToCart}
                disabled={!product}
              >
                {isInCart(product?.id) ? 'Add More' : 'Add to Cart'}
              </button>
              {isInCart(product?.id) && (
                <button 
                  className={styles.cartButton}
                  onClick={handleGoToCart}
                >
                  Go to Cart
                </button>
              )}
            </div>
            {isInCart(product?.id) && (
              <span className={styles.cartInfo}>
                In cart: {getProductQuantity(product?.id)}
              </span>
            )}
            {addToCartSuccess && (
              <span className={styles.successMessage}>
                ✓ Added to cart!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <h2>Customer Reviews ({actualReviewCount})</h2>
        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : reviewsError ? (
          <p className={styles.error}>Error loading reviews: {reviewsError}</p>
        ) : reviews && reviews.length > 0 ? (
          <ul className={styles.reviewList}>
            {reviews.map((review, index) => (
              <li key={review.id || index} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <strong>{review.author || review.authorName || 'Anonymous User'}</strong>
                  <StarRating rating={review.rating} />
                </div>
                <p>{review.comment || review.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet. Be the first to review this product!</p>
        )}
        
        {user ? (
          <div>
            {submitError && (
              <div className={styles.submitError}>
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className={styles.submitSuccess}>
                ✓ Review submitted successfully! Thank you for your feedback.
              </div>
            )}
            {submittingReview && (
              <div className={styles.submittingIndicator}>
                Submitting your review...
              </div>
            )}
            <ReviewForm onSubmit={handleReviewSubmit} disabled={submittingReview} />
          </div>
        ) : (
          <p className={styles.loginPrompt}>
            <Link 
              to="/login" 
              state={returnToProductState}
            >
              Login
            </Link> or <Link 
              to="/register" 
              state={returnToProductState}
            >
              Register
            </Link> to write a review
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage; 