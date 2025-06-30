import React, { useState } from 'react';
import styles from './styles.module.css';

const ReviewForm = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0 && comment) {
      onSubmit({ rating, comment, author: 'New User' }); 
      setRating(0);
      setComment('');
    } else {
      alert('Please provide a rating and a comment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Write a Review</h3>
      <div className={styles.ratingInput}>
        <label>Rating:</label>
        <div onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= (hoverRating || rating) ? styles.starFilled : styles.star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
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
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      <button type="submit" className={styles.button}>Submit Review</button>
    </form>
  );
};

export default ReviewForm; 