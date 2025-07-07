import React, { useState } from 'react';
import styles from './styles.module.css';

const ReviewForm = ({ onSubmit, disabled = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (rating > 0 && comment.trim()) {
      onSubmit({ rating, comment: comment.trim(), author: 'New User' }); 
      setRating(0);
      setComment('');
    } else {
      alert('Please provide a rating and a comment.');
    }
  };

  const handleStarClick = (star) => {
    if (!disabled) {
      setRating(star);
    }
  };

  const handleStarHover = (star) => {
    if (!disabled) {
      setHoverRating(star);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${disabled ? styles.disabled : ''}`}>
      <h3>Write a Review</h3>
      <div className={styles.ratingInput}>
        <label>Rating:</label>
        <div onMouseLeave={() => !disabled && setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${star <= (hoverRating || rating) ? styles.starFilled : styles.star} ${disabled ? styles.starDisabled : ''}`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div className={styles.commentInput}>
        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => !disabled && setComment(e.target.value)}
          disabled={disabled}
          required
        />
      </div>
      <button 
        type="submit" 
        className={styles.button}
        disabled={disabled}
      >
        {disabled ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm; 