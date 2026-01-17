import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { ShoppingCart, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import ReviewModal from '../components/ReviewModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [refreshReviews, setRefreshReviews] = useState(0); // Trigger to re-fetch reviews
    const [isWishlisted, setIsWishlisted] = useState(false); // Wishlist state

    const dispatch = useDispatch();
    const { loading: loadingCart } = useSelector(state => state.cart);

    const handleAddToCart = () => {
        if (!product) return;
        dispatch(addToCart({
            productId: product._id,
            quantity: 1, // Logic for quantity selector can be added later if needed in UI
            variant: selectedVariant
        }));
    };

    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!product?._id) return;
            try {
                const res = await axios.get(`${API_URL}/reviews/product/${product._id}`);
                setReviews(res.data.data);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            }
        };

        const checkWishlist = async () => {
            if (!product?._id) return;
            try {
                const token = localStorage.getItem('token');
                if (!token) return; // Not logged in

                const res = await axios.get(`${API_URL}/wishlist`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const exists = res.data.data.some(p => p._id === product._id);
                setIsWishlisted(exists);
            } catch (err) {
                // console.error("Failed to check wishlist", err);
            }
        };

        if (product?._id) {
            fetchReviews();
            checkWishlist();
        }
    }, [product?._id, refreshReviews]); // Run when product changes or refresh triggered

    const navigate = useNavigate();

    const handleToggleWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            await axios.post(`${API_URL}/wishlist/toggle/${product._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsWishlisted(!isWishlisted);
        } catch (err) {
            console.error("Failed to toggle wishlist", err);
            // ... handle 401
            if (err.response?.status === 401) {
                // alert("Session expired"); // Optional, maybe too intrusive
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Fetch by slug OR id
                let data;
                const isId = /^[0-9a-fA-F]{24}$/.test(slug);

                if (isId) {
                    data = await productService.getProductById(slug);
                } else {
                    data = await productService.getProductBySlug(slug);
                }
                setProduct(data);
                // Auto-select first variant if exists
                if (data.hasVariants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                } else {
                    setSelectedVariant(null);
                }
                setActiveImage(0); // Reset image on product change

                // Fetch Related Products (Recommendations)
                if (data._id) {
                    const relatedRes = await axios.get(`${API_URL}/products/${data._id}/recommendations`);
                    setRelatedProducts(relatedRes.data);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProduct();
    }, [slug]);

    if (loading) return <div className="text-center py-20 animate-pulse">Loading product details...</div>;
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    const currentPrice = selectedVariant?.price || product.basePrice;
    const currentStock = selectedVariant?.stock || product.stock;
    const isOutOfStock = currentStock <= 0;

    // Construct gallery images ensuring mainImage is first
    const galleryImages = [
        product.mainImage,
        ...(product.images || [])
    ].filter((img, index, self) => img && self.indexOf(img) === index);

    return (
        <div className="mx-4 lg:mx-[10%] py-6 sm:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                {/* Image Gallery */}
                <div className="space-y-3 sm:space-y-4">
                    <div className="aspect-square bg-white rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative group">
                        {galleryImages.length > 0 ? (
                            <img src={galleryImages[activeImage]} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="text-gray-300">No Image Available</div>
                        )}
                        {product.isBestSeller && (
                            <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                                BEST SELLER
                            </span>
                        )}
                        <button
                            onClick={handleToggleWishlist}
                            className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm min-w-[40px] min-h-[40px] flex items-center justify-center ${isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    {/* Thumbnails if multiple images */}
                    {galleryImages.length > 1 && (
                        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 flex-shrink-0 bg-white p-1.5 sm:p-2 transition-all min-w-[64px] ${activeImage === idx ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <div className="mb-2 text-sm text-teal-600 font-bold uppercase tracking-wide">
                        {product.category?.name || 'Accessory'}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{product.title}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-yellow-400 items-center gap-1">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i <= Math.round(product.averageRating || 0) ? 'fill-current' : 'text-gray-300 fill-gray-300'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-bold ml-1 text-gray-700">{product.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium border-l pl-4 border-gray-300">
                            {product.numReviews} {product.numReviews === 1 ? 'Review' : 'Reviews'}
                        </span>
                        {isOutOfStock ? (
                            <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded ml-auto">Out of Stock</span>
                        ) : (
                            <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded ml-auto">In Stock</span>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-4xl font-black text-slate-900">₹{currentPrice}</span>
                            {product.basePrice > currentPrice && (
                                <div className="flex flex-col mb-1">
                                    <span className="text-lg text-gray-400 line-through">₹{product.basePrice}</span>
                                    <span className="text-xs text-red-500 font-bold">SAVE {Math.round((1 - currentPrice / product.basePrice) * 100)}%</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Includes all taxes. Free shipping on this item.</p>
                    </div>

                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-sm font-bold text-slate-700 mb-3">Select Variant</h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant._id}
                                        onClick={() => setSelectedVariant(variant._id)}
                                        className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium min-h-[44px] ${selectedVariant === variant._id
                                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        {variant.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px]"
                        >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-teal-500 text-teal-600 hover:bg-teal-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px]">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Wishlist</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-teal-500 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Free Delivery</h4>
                                <p className="text-xs text-gray-500 mt-1">On orders over ₹499</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-teal-500 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">1 Year Warranty</h4>
                                <p className="text-xs text-gray-500 mt-1">Manufacturing defects</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="mt-8 sm:mt-12 md:mt-16">
                <div className="border-b border-gray-200 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 sm:gap-4 min-w-max px-1">
                        {['description', 'specifications', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 sm:pb-4 px-3 sm:px-4 font-semibold text-sm sm:text-base transition-all whitespace-nowrap min-h-[44px] flex items-center ${activeTab === tab
                                        ? 'border-b-2 border-teal-500 text-teal-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[200px] text-gray-600 leading-relaxed max-w-4xl">
                    {activeTab === 'description' && (
                        <div className="prose prose-slate max-w-none">
                            <p>{product.description || "No description available."}</p>
                            {/* Check if description has content, otherwise generic text */}
                            {!product.description && <p className="text-gray-400 italic">Product details coming soon.</p>}
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {/* General Specs */}
                            {product.specs?.map((spec, idx) => (
                                <div key={idx} className="flex justify-between border-b border-gray-100 pb-2 group hover:bg-gray-50 px-2 rounded">
                                    <span className="font-medium text-gray-900">{spec.label}</span>
                                    <span>{spec.value}</span>
                                </div>
                            ))}

                            {/* Dynamic Attributes from Filterable Attributes can be shown here too if needed */}
                            {product.attributes && Object.entries(product.attributes).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-gray-100 pb-2 group hover:bg-gray-50 px-2 rounded">
                                    <span className="font-medium text-gray-900">{key}</span>
                                    <span>{val}</span>
                                </div>
                            ))}

                            {(!product.specs?.length && (!product.attributes || Object.keys(product.attributes).length === 0)) && (
                                <div className="col-span-2 text-center text-gray-400 py-10">
                                    No detailed specifications available.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Customer Reviews</h3>
                                <Button onClick={() => setIsReviewModalOpen(true)}>Write a Review</Button>
                            </div>

                            {reviews.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl">
                                    <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                    <h3 className="font-bold text-gray-900">No reviews yet</h3>
                                    <p className="text-gray-500 mb-4">Be the first to review this product!</p>
                                    <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(true)}>Write a Review</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div key={review._id} className="bg-gray-50 p-4 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{review.user?.name || 'Anonymous'}</h4>
                                                        <div className="flex text-yellow-400 text-xs">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3 h-3 ${i <= review.rating ? 'fill-current' : 'text-gray-300 fill-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 text-sm">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                productId={product._id}
                onSubmitSuccess={() => setRefreshReviews(prev => prev + 1)}
            />

            {/* Related Products */}
            {recommendations.length > 0 && (
                <div className="mt-12 sm:mt-16 md:mt-20">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8">You May Also Like</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        {relatedProducts.map(rp => (
                            <Link to={`/product/${rp.slug || rp._id}`} key={rp._id} className="group bg-white rounded-xl border border-gray-100 p-4 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                    {rp.mainImage ? (
                                        <img src={rp.mainImage} alt={rp.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="text-gray-300 text-xs">No Image</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm min-h-[2.5em]" title={rp.title}>{rp.title}</h3>
                                <div className="mt-auto">
                                    <span className="text-lg font-extrabold text-slate-900">₹{rp.basePrice}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
