import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`star ${sizeClasses[size]} ${
            star <= rating ? 'star-filled' : 'star-empty'
          } ${!readonly ? 'cursor-pointer' : ''}`}
          onClick={() => handleStarClick(star)}
        />
      ))}
    </div>
  );
};

export default RatingStars; 