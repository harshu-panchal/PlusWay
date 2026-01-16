import { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ReviewModal = ({ isOpen, onClose, productId, onSubmitSuccess }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            };

            await axios.post(`${API_URL}/reviews`, {
                rating,
                comment,
                productId
            }, config);

            onSubmitSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating Selector */}
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Your Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you like or dislike about this product?"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none h-32"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
