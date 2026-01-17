import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import axios from 'axios';
import Button from '../../../shared/components/ui/Button';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Wishlist = () => {
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWishlistProducts(res.data.data);
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/wishlist/toggle/${productId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Optimistic update
            setWishlistProducts(prev => prev.filter(p => p._id !== productId));
        } catch (err) {
            console.error("Failed to remove from wishlist", err);
        }
    };

    if (loading) return <div className="text-center py-20">Loading your wishlist...</div>;

    return (
        <div className="mx-4 lg:mx-[10%] py-8 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Heart className="w-8 h-8 text-red-500 fill-current" />
                My Wishlist
            </h1>

            {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6">Save items you love to buy them later.</p>
                    <Link to="/products">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlistProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-xl border border-gray-100 p-4 transition-all hover:shadow-lg group flex flex-col">
                            <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                                <img
                                    src={product.mainImage}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <button
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="absolute top-2 right-2 p-2 bg-white/90 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm min-h-[2.5em]">
                                <Link to={`/product/${product.slug || product._id}`} className="hover:text-teal-600">
                                    {product.title}
                                </Link>
                            </h3>

                            <div className="mt-auto pt-4 flex items-center justify-between">
                                <span className="text-lg font-extrabold text-slate-900">₹{product.basePrice}</span>
                                <Link to={`/product/${product.slug || product._id}`}>
                                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                                        <ShoppingCart className="w-4 h-4" />
                                        View
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
