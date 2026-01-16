import React, { useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductRow = ({ title, products, link, loading }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-12 border-b border-gray-100 bg-white">
            <div className="mx-4 lg:mx-[10%]">
                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">{title}</h2>
                        <div className="h-1 w-16 bg-teal-500 rounded-full"></div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <Link to={link || '/products'} className="hidden md:flex items-center text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wide group">
                            View All
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* List - ScrollSnap */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] -mx-4 px-4 lg:-mx-0 lg:px-0"
                >
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex-shrink-0 w-[240px] md:w-[280px]">
                                <div className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse"></div>
                            </div>
                        ))
                    ) : products && products.length > 0 ? (
                        products.map(product => (
                            <div key={product._id} className="flex-shrink-0 w-[240px] md:w-[280px] snap-start">
                                <ProductCard product={product} />
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 text-gray-400 italic">No products found.</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductRow;
