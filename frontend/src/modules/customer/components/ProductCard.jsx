import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlistItem } from '../store/slices/wishlistSlice';

const ProductCard = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    const { loading: loadingCart } = useSelector(state => state.cart);
    const wishlist = useSelector(state => state.wishlist);
    const wishlistItems = wishlist?.items || [];

    if (!product) return null;

    const { _id, title, basePrice, mainImage, slug, category, isNewArrival, isBestSeller, averageRating, ratingCount } = product;
    const isWished = wishlistItems.some(item => item._id === _id);

    const handleIncrement = (e) => { e.preventDefault(); e.stopPropagation(); setQuantity(prev => prev + 1); };
    const handleDecrement = (e) => { e.preventDefault(); e.stopPropagation(); if (quantity > 1) setQuantity(prev => prev - 1); };
    const handleWishlistToggle = (e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleWishlistItem(product)); };
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(addToCart({
            productId: _id,
            quantity: quantity,
            variant: product.hasVariants && product.variants?.length > 0 ? product.variants[0] : null
        }));
    };

    return (
        <Link to={`/product/${slug}`} className="group relative bg-white rounded-[24px] p-3 transition-all duration-300 hover:shadow-premium border border-slate-100/50">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {isNewArrival && <span className="bg-teal-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase">New</span>}
                {isBestSeller && <span className="bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase">Hot</span>}
            </div>

            {/* Wishlist Button */}
            <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 z-20 p-2 rounded-full glass hover:bg-white transition-all duration-300 shadow-sm"
            >
                <Heart className={`w-4 h-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            </button>

            {/* Image Area */}
            <div className="aspect-square bg-slate-50/50 rounded-2xl relative overflow-hidden mb-4 p-4">
                {mainImage ? (
                    <img src={mainImage} alt={title} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">📱</div>
                )}
            </div>

            {/* Content */}
            <div className="px-1">
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex text-amber-400">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tight">{(averageRating || 4.5).toFixed(1)} • {ratingCount || 120}</span>
                </div>

                <h3 className="font-bold text-slate-900 mb-1 leading-tight line-clamp-2 min-h-[2.5rem] text-[13px] group-hover:text-teal-600 transition-colors">
                    {title}
                </h3>

                <p className="text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    {category?.name || 'Accessories'}
                </p>

                <div className="flex items-center justify-between mt-auto pt-1">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-900">₹{basePrice}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 rounded-full px-1 py-1">
                        <div className="flex items-center">
                            <button onClick={handleDecrement} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30" disabled={quantity === 1}><Minus className="w-3 h-3" /></button>
                            <span className="text-[11px] font-black text-slate-900 w-4 text-center">{quantity}</span>
                            <button onClick={handleIncrement} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={handleAddToCart} className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-colors">
                            <ShoppingCart className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
