import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlistItem } from '../store/slices/wishlistSlice';

const ProductCard = ({ product }) => {
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const {
        _id,
        title,
        basePrice,
        mainImage,
        slug,
        category
    } = product;

    const handleIncrement = (e) => {
        e.preventDefault();
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const dispatch = useDispatch();
    const { loading: loadingCart } = useSelector(state => state.cart);
    const wishlist = useSelector(state => state.wishlist);
    const wishlistItems = wishlist?.items || [];

    // Check if product is in wishlist
    const isWished = wishlistItems.some(item => item._id === _id);

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(toggleWishlistItem(product));
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(addToCart({
            productId: _id,
            quantity: quantity,
            variant: product.hasVariants && product.variants?.length > 0 ? product.variants[0] : null // Default to first variant if exists but not selected? Architecture choice. For card, maybe just base product?
            // Note: For simple cards, usually we add base product. If variants required, we might redirect to detail page.
            // But let's assume base product or default variant for now.
        }));
    };

    return (
        <Link to={`/product/${slug}`} className="block bg-white rounded-2xl p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group relative border border-gray-300">
            {/* Badges */}
            {(product.isNewArrival || product.isBestSeller) && (
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.isNewArrival && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEW</span>}
                    {product.isBestSeller && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">HOT</span>}
                </div>
            )}

            {/* Image Area */}
            <div className="aspect-square bg-gray-50 rounded-xl relative overflow-hidden mb-3">
                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-300 group/btn"
                >
                    <Heart
                        className={`w-4 h-4 transition-all duration-300 ${isWished
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-slate-400 group-hover/btn:text-red-500'
                            }`}
                    />
                </button>

                <div className="absolute inset-0 flex items-center justify-center">
                    {!mainImage && <span className="text-6xl opacity-10">📱</span>}
                </div>
                {mainImage && (
                    <img
                        src={mainImage}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                )}
            </div>

            {/* Content */}
            <div>
                <h3 className="font-bold text-slate-900 mb-1 leading-snug group-hover:text-teal-600 transition-colors line-clamp-2 min-h-[2.5rem] text-sm">
                    {title}
                </h3>

                {/* Reviews / Rating */}
                <div className="flex items-center gap-1 mb-1.5">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-3 h-3 ${star <= (product.averageRating || 4.5) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium ml-1">
                        ({product.ratingCount || 120})
                    </span>
                </div>

                <p className="text-xs text-slate-500 mb-2 line-clamp-1">{category?.name || 'Accessory'}</p>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-bold text-slate-900">₹{basePrice}</span>
                    {/* <span className="text-sm text-slate-400 line-through">₹{basePrice * 1.2}</span> */}
                </div>

                {/* Add to Cart Action */}
                <div className="flex gap-2">
                    {/* Quantity Selector */}
                    <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-between px-2 py-1.5" onClick={(e) => e.preventDefault()}>
                        <button
                            onClick={handleDecrement}
                            className={`transition-colors ${quantity === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-slate-900'}`}
                            disabled={quantity === 1}
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-slate-900 text-xs w-4 text-center select-none">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="text-gray-400 hover:text-slate-900 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="bg-white border text-teal-500 border-teal-500 rounded-lg px-3 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-sm"
                    >
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
