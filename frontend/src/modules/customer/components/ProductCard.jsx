import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

const ProductCard = ({ id }) => {
    const [quantity, setQuantity] = useState(1);

    const handleIncrement = (e) => {
        e.stopPropagation();
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = (e) => {
        e.stopPropagation();
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        console.log(`Added product ${id} with quantity ${quantity} to cart`);
        // Future: Dispatch redux action here
    };

    return (
        <div className="bg-white rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group relative border border-gray-100">
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Sale -20%
            </div>

            {/* Image Area */}
            <div className="aspect-[4/5] bg-gray-50 rounded-xl relative overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-10 transition-transform duration-500 group-hover:scale-110">📱</span>
                </div>
                <img
                    src={`https://images.unsplash.com/photo-${1510000000000 + id}?w=500&h=600&fit=crop`}
                    alt="Product"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-0"
                />
            </div>

            {/* Content */}
            <div>
                <h3 className="font-bold text-slate-900 mb-1 leading-snug group-hover:text-teal-600 transition-colors">
                    Premium iPhone 15 Ultra Case
                </h3>
                <p className="text-sm text-slate-500 mb-3">Protective Gear</p>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-slate-900">₹999</span>
                    <span className="text-sm text-slate-400 line-through">₹1,249</span>
                </div>

                {/* Add to Cart Action */}
                <div className="flex gap-3">
                    {/* Quantity Selector */}
                    <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-between px-4 py-2">
                        <button
                            onClick={handleDecrement}
                            className={`transition-colors ${quantity === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-slate-900'}`}
                            disabled={quantity === 1}
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-slate-900 text-sm w-4 text-center select-none">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="text-gray-400 hover:text-slate-900 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="bg-white border text-teal-500 border-teal-500 rounded-xl px-4 flex items-center justify-center hover:bg-teal-50 transition-colors shadow-sm"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
