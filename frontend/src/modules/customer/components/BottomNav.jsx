import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingCart, User, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const location = useLocation();
    const { totalQuantity } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const navItems = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Categories', icon: Grid, path: '/products' },
        { label: 'Wishlist', icon: Heart, path: '/wishlist' },
        { label: 'Cart', icon: ShoppingCart, path: '/cart', count: totalQuantity },
        { label: 'Profile', icon: User, path: user ? '/profile' : '/login' },
    ];

    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-100 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className="relative flex flex-col items-center justify-center w-full h-full group"
                    >
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className={`flex flex-col items-center transition-colors duration-200 ${isActive(item.path)
                                ? 'text-teal-600'
                                : 'text-slate-400 group-hover:text-slate-600'
                                }`}
                        >
                            <div className="relative">
                                <item.icon
                                    className={`w-5 h-5 ${isActive(item.path) ? 'fill-teal-50' : ''}`}
                                    strokeWidth={isActive(item.path) ? 2.5 : 2}
                                />
                                {item.count > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-bold mt-1 tracking-tight">
                                {item.label}
                            </span>
                        </motion.div>

                        {isActive(item.path) && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute -top-[1px] w-8 h-[2px] bg-teal-600 rounded-full"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
