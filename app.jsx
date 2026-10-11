import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

export default function App() {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotal(data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        alert('Login failed! Make sure user exists in database.');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews]);
    fetchReviews();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-extrabold text-gray-800">{avgRating}</span>
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-gray-500">({total} reviews)</span>
          </div>
        </div>
        {!token && (
          <button onClick={handleLogin} className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700">
            Demo Login
          </button>
        )}
      </header>

      {token ? (
        <ReviewForm token={token} onReviewAdded={handleReviewAdded} />
      ) : (
        <p className="mb-6 text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
          Please click "Demo Login" to post a review.
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((item) => (
          <div key={item._id} className="bg-white p-5 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <StarRating rating={item.rating} />
                <h4 className="font-bold text-lg mt-1">{item.title}</h4>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm mb-3">{item.comment}</p>
            <span className="text-xs font-semibold text-gray-500">— {item.user?.name || 'Anonymous'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}