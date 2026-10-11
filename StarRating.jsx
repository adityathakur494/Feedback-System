import React from 'react';

export default function StarRating({ rating, setRating, editable = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          disabled={!editable}
          onClick={() => editable && setRating(star)}
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${
            editable ? 'hover:scale-110 transition-transform' : 'cursor-default'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}