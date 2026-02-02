import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, ShieldCheck } from 'lucide-react';
import { updateCartItem, removeCartItem } from '../store/slices/cartSlice';
import Button from '../../../shared/components/ui/Button';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalAmount, loading } = useSelector((state) => state.cart);

    const handleUpdateQuantity = (itemId, newQty) => {
        if (newQty < 1) return;
        dispatch(updateCartItem({ itemId, quantity: newQty }));
    };

    const handleRemove = (itemId) => {
        dispatch(removeCartItem(itemId));
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold mt-6 tracking-widest uppercase text-xs">Loading Cart</p>
            </div>
        );
    }

    return (
        <div className="mx-4 lg:mx-[10%] py-8 sm:py-12 md:py-16 min-h-screen">
            <header className="mb-10 sm:mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-teal-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Shopping Cart
                    </h1>
                </div>
                <p className="text-slate-500 font-medium">
                    {items.length === 0 ? 'Your cart is currently empty.' : `You have ${items.length} unique items in your cart.`}
                </p>
            </header>

            {items.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 sm:py-32 bg-white rounded-[40px] border border-slate-100 shadow-sm"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet. Let's find some amazing accessories!</p>
                    <Link to="/products">
                        <Button className="rounded-full px-10 py-6 h-auto text-base shadow-xl shadow-teal-500/20">
                            Start Shopping <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                    {/* Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center"
                                >
                                    <Link to={`/product/${item.product?.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-4 group">
                                        <img
                                            src={item.product?.mainImage}
                                            alt={item.product?.title}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </Link>

                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{item.product?.title}</h3>
                                        {item.variant && (
                                            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">{item.variant.name}</p>
                                        )}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 justify-center sm:justify-start">
                                            <span className="text-xl font-black text-slate-900">₹{item.variant?.price || item.product?.basePrice}</span>

                                            <div className="flex items-center justify-center sm:justify-start bg-slate-100 rounded-full px-2 py-1 w-fit mx-auto sm:mx-0">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-30"
                                                    disabled={item.quantity === 1}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-black text-slate-900 w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center sm:items-end gap-3 sm:ml-auto">
                                        <span className="text-xl font-black text-teal-600">₹{(item.variant?.price || item.product?.basePrice) * item.quantity}</span>
                                        <button
                                            onClick={() => handleRemove(item._id)}
                                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="pt-4">
                            <Link to="/products" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors group">
                                <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-900 rounded-[40px] p-8 text-white sticky top-24 shadow-2xl shadow-slate-900/20">
                            <h2 className="text-2xl font-black mb-8 tracking-tight">Order Summary</h2>

                            <div className="space-y-6 mb-8">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="text-lg font-bold text-white">₹{totalAmount}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm font-bold uppercase tracking-widest">Shipping</span>
                                    <span className="text-sm font-bold text-teal-400">FREE</span>
                                </div>
                                <div className="h-px bg-white/10 my-6"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Total Amount</span>
                                    <span className="text-3xl font-black text-white leading-none">₹{totalAmount}</span>
                                </div>
                            </div>

                            <Button
                                onClick={() => navigate('/checkout')}
                                className="w-full h-auto py-5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-black text-base uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all active:scale-95 mb-6"
                            >
                                Process to Checkout
                            </Button>

                            <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4 text-teal-500" />
                                SECURED BY RAZORPAY
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
