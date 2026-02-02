import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { toggleWishlistItem, fetchWishlist } from '../store/slices/wishlistSlice';
import Button from '../../../shared/components/ui/Button';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { items = [], loading } = useSelector(state => state.wishlist || {});

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    const handleRemove = (product) => {
        dispatch(toggleWishlistItem(product));
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold mt-6 tracking-widest uppercase text-xs">Loading Wishlist</p>
            </div>
        );
    }

    return (
        <div className="mx-4 lg:mx-[10%] py-8 sm:py-12 min-h-screen">
            <header className="mb-10 sm:mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        My Wishlist
                    </h1>
                </div>
                <p className="text-slate-500 font-medium">
                    {items.length === 0 ? 'Your favorite items will appear here.' : `You have ${items.length} items saved for later.`}
                </p>
            </header>

            {items.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 sm:py-32 bg-white rounded-[32px] border border-slate-100 shadow-sm"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="w-10 h-10 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't saved anything yet. Start exploring our premium collection!</p>
                    <Link to="/products">
                        <Button className="rounded-full px-8 py-6 h-auto text-base shadow-xl shadow-teal-500/20">
                            Start Shopping <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    <AnimatePresence mode="popLayout">
                        {items.filter(product => product && typeof product === 'object').map((product, index) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group relative bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm hover:shadow-premium transition-all duration-500"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(product)}
                                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm border border-slate-100"
                                    title="Remove from Wishlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Image Area */}
                                <Link to={`/product/${product.slug || product._id}`} className="block aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative p-6">
                                    <img
                                        src={product.mainImage}
                                        alt={product.title}
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    {product.isOutOfStock && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Out of Stock</span>
                                        </div>
                                    )}
                                </Link>

                                <div className="px-2">
                                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-teal-600 transition-colors">
                                        {product.title}
                                    </h3>

                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-slate-900">₹{product.basePrice}</span>
                                        </div>
                                        <Link to={`/product/${product.slug || product._id}`}>
                                            <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                                                <ShoppingBag className="w-5 h-5" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
