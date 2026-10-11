import React, { useState } from 'react';
import StarRating from 'StarRating';

export default function ReviewForm({ token, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !comment) return alert('Please fill in all fields');

    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, title, comment })
      });

      if (res.ok) {
        const data = await res.json();
        onReviewAdded(data);
        setTitle('');
        setComment('');
        setRating(5);
      } else {
        alert('Failed to post review');
      }
    } catch (error) {
      console.error('Error posting review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Write a Review</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Rating</label>
        <StarRating rating={rating} setRating={setRating} editable={true} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Summarize your feedback"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Feedback</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          placeholder="Write your review here..."
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
        Submit Review
      </button>
    </form>
  );
}