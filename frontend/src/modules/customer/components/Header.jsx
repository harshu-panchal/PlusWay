import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
    ShoppingCart, Search, User, Menu, X, Phone, ChevronRight,
    Zap, Home, Box, Heart
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { openCart, fetchCart } from '../store/slices/cartSlice';
import CartDrawer from './CartDrawer';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const catalogRef = useRef(null);
    const navigate = useNavigate();

    // Redux Cart State
    const dispatch = useDispatch();
    const { totalQuantity, totalAmount } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    // Fetch initial cart state
    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/categories`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Close catalog when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (catalogRef.current && !catalogRef.current.contains(event.target)) {
                setIsCatalogOpen(false);
                setActiveCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const topNavItems = [
        { label: 'For Partners', href: '/partners' },
        { label: 'Warranty', href: '/warranty' },
        { label: 'Delivery and payment', href: '/delivery-payment' },
        { label: 'Contacts', href: '/contacts' },
        { label: 'News', href: '/news' },
        { label: 'Promotion', href: '/promotion' },
        { label: 'Receipts', href: '/receipts' },
    ];

    // Helper to get children of a category
    const getChildren = (parentId) => categories.filter(c => (c.parent || null) === parentId);

    // Get root categories
    const rootCategories = categories.filter(c => !c.parent);

    // Handle search submit
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    // Helper to build hierarchical path for a category by traversing parent chain
    // e.g., "/protective-glasses/xiaomi/xiaomi-mi-series" instead of "/category/xiaomi-mi-series"
    const buildCategoryPath = (category) => {
        if (!category) return '/products';

        const pathParts = [];
        let current = category;

        // Traverse up the parent chain to build the full path
        while (current) {
            pathParts.unshift(current.slug);
            if (current.parent) {
                current = categories.find(c => c._id === current.parent);
            } else {
                current = null;
            }
        }

        return '/' + pathParts.join('/');
    };

    return (
        <header className="sticky top-0 z-50 transition-all duration-300">
            <div className="glass shadow-soft">
                <CartDrawer />

                {/* Top Navigation Bar - Professional Desktop-only */}
                <div className="hidden lg:block bg-slate-900 text-slate-400 py-1.5 border-b border-slate-800">
                    <div className="container mx-auto px-4 lg:px-[10%]">
                        <div className="flex items-center justify-between h-7 text-[10px] font-bold tracking-widest uppercase">
                            <nav className="flex items-center space-x-6">
                                {topNavItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className="hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="flex items-center space-x-6">
                                <Link
                                    to={user ? "/profile" : "/login"}
                                    className="flex items-center space-x-2 hover:text-white transition-colors"
                                >
                                    <User className="w-3 h-3 text-teal-500" />
                                    <span>{user ? `Account: ${user.name.split(' ')[0]}` : 'Sign In'}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="container mx-auto px-4 lg:px-[10%]">
                    <div className="flex items-center justify-between py-3 lg:py-4 gap-4 lg:gap-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
                            <div className="relative flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-[14px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="currentColor" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl lg:text-2xl font-black tracking-tighter text-slate-900 leading-none">
                                    PLUSWAY
                                </span>
                                <span className="text-[9px] lg:text-[10px] uppercase font-bold text-slate-400 tracking-[0.3em] leading-none mt-1">
                                    STORE
                                </span>
                            </div>
                        </Link>

                        {/* Catalog - Desktop */}
                        <div className="relative hidden lg:block" ref={catalogRef}>
                            <button
                                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                                className={`flex items-center gap-3 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${isCatalogOpen
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {isCatalogOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                                Catalog
                            </button>

                            {/* Dropdown Menu (Existing Logic Kept) */}
                            {isCatalogOpen && (
                                <div className="absolute top-full left-0 mt-4 flex items-start z-50 animate-fade-in-up">
                                    <div className="w-72 max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-premium border border-slate-100 py-3 relative z-20">
                                        {/* ... root categories section ... */}
                                        <div className="flex flex-col">
                                            <Link to="/products" className="flex items-center gap-3 px-6 py-3 bg-slate-50 text-teal-600 font-bold text-sm" onClick={() => setIsCatalogOpen(false)}>
                                                <Box className="w-4 h-4" />
                                                Browse All
                                            </Link>
                                            {rootCategories.map((category) => (
                                                <div key={category._id} onMouseEnter={() => setActiveCategory(category._id)}>
                                                    <Link
                                                        to={buildCategoryPath(category)}
                                                        className={`flex items-center justify-between px-6 py-3 text-sm font-semibold transition-colors ${activeCategory === category._id ? 'text-teal-600 bg-teal-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                                                        onClick={() => setIsCatalogOpen(false)}
                                                    >
                                                        <span className="truncate">{category.name}</span>
                                                        {getChildren(category._id).length > 0 && <ChevronRight className="w-4 h-4 opacity-50" />}
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {activeCategory && getChildren(activeCategory).length > 0 && (
                                        <div className="w-[600px] h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-premium border border-slate-100 p-8 ml-4 animate-fade-in-up">
                                            <div className="grid grid-cols-2 gap-8">
                                                {getChildren(activeCategory).map((sub) => (
                                                    <div key={sub._id}>
                                                        <Link to={buildCategoryPath(sub)} onClick={() => setIsCatalogOpen(false)}>
                                                            <h4 className="font-bold text-slate-900 mb-3 hover:text-teal-600">{sub.name}</h4>
                                                        </Link>
                                                        <div className="flex flex-col space-y-2">
                                                            {getChildren(sub._id).map((child) => (
                                                                <Link key={child._id} to={buildCategoryPath(child)} className="text-sm text-slate-500 hover:text-teal-500" onClick={() => setIsCatalogOpen(false)}>
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search - Responsive */}
                        <div className="flex-1 max-w-xl mx-2 lg:mx-4">
                            <form onSubmit={handleSearch} className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-5 pr-12 py-2.5 lg:py-3 bg-slate-100 border-2 border-transparent focus:bg-white focus:border-teal-500 rounded-full outline-none transition-all text-sm font-medium"
                                />
                                <button type="submit" className="absolute right-2 top-1.5 lg:top-2 w-8 h-8 lg:w-9 lg:h-9 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                                    <Search className="w-4 h-4" />
                                </button>
                            </form>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 lg:gap-4">
                            <Link to="/wishlist" className="p-2.5 text-slate-600 hover:text-red-500 transition-colors relative">
                                <Heart className="w-5 h-5 lg:w-6 lg:h-6" />
                            </Link>

                            <button onClick={() => dispatch(openCart())} className="flex items-center gap-2 p-1.5 lg:p-2.5 bg-slate-900 lg:bg-transparent text-white lg:text-slate-900 rounded-full lg:rounded-none group">
                                <div className="relative">
                                    <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 lg:group-hover:text-teal-600" />
                                    {totalQuantity > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white lg:border-slate-50">
                                            {totalQuantity}
                                        </span>
                                    )}
                                </div>
                                <div className="hidden lg:flex flex-col items-start leading-none">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cart</span>
                                    <span className="text-xs font-bold">₹{totalAmount}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <CartDrawer />
        </header>
    );
};

export default Header;
