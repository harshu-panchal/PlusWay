import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
    ShoppingCart, Search, User, Menu, X, Phone, ChevronRight,
    Zap, Home, Box
} from 'lucide-react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const catalogRef = useRef(null);
    const navigate = useNavigate();

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
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

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm/50 transition-all duration-300 backdrop-blur-md bg-white/95">
            {/* Top Navigation Bar - Premium Dark Theme */}
            <div className="bg-slate-900 text-slate-300 py-2">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-8 text-xs font-medium tracking-wide">
                        {/* Top Nav Links - Desktop */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            {topNavItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    className="hover:text-white transition-colors uppercase"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side - User Account */}
                        <div className="flex items-center space-x-6 ml-auto">
                            <Link
                                to="/profile"
                                className="flex items-center space-x-2 hover:text-white transition-colors group"
                            >
                                <div className="p-1 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors">
                                    <User className="w-3 h-3" />
                                </div>
                                <span className="hidden sm:inline">LOG IN</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-5 gap-6">
                    {/* Logo - Modern & Bold */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="flex flex-col">
                            <span className="text-3xl font-extrabold text-slate-900 tracking-tighter group-hover:text-primary-600 transition-colors">APPZETO</span>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] -mt-1 group-hover:text-primary-400 transition-colors">E-Commerce</span>
                        </div>
                    </Link>

                    {/* Product Catalog Button - Rounded Pill with Dropdown */}
                    <div className="relative hidden lg:block" ref={catalogRef}>
                        <button
                            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg active:translate-y-0 ${isCatalogOpen ? 'bg-teal-600 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white hover:-translate-y-0.5'}`}
                        >
                            {isCatalogOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            <span className="font-semibold text-sm">Product Catalog</span>
                        </button>

                        {/* Dropdown Menu */}
                        {isCatalogOpen && (
                            <div className="absolute top-full left-0 mt-3 flex items-start z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Main Catalog List */}
                                <div className="w-72 max-h-[65vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 py-2 relative z-20">
                                    <div className="flex flex-col">
                                        <div
                                            onMouseEnter={() => setActiveCategory(null)}
                                        >
                                            <Link
                                                to="/products"
                                                className={`flex items-center justify-between px-5 py-3 transition-colors group border-b border-gray-50 bg-slate-50`}
                                                onClick={() => setIsCatalogOpen(false)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 flex items-center justify-center text-teal-500">
                                                        <Box className="w-5 h-5" strokeWidth={2} />
                                                    </div>
                                                    <span className="font-medium text-slate-700 group-hover:text-teal-700">
                                                        Show all products
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>

                                        {rootCategories.map((category) => {
                                            const hasSub = getChildren(category._id).length > 0;
                                            return (
                                                <div
                                                    key={category._id}
                                                    onMouseEnter={() => hasSub ? setActiveCategory(category._id) : setActiveCategory(null)}
                                                >
                                                    <Link
                                                        to={`/category/${category.slug}`}
                                                        className={`flex items-center justify-between px-5 py-3 transition-colors group border-b border-gray-50 last:border-0 ${activeCategory === category._id ? 'bg-slate-50 text-teal-600' : 'hover:bg-slate-50'}`}
                                                        onClick={() => !hasSub && setIsCatalogOpen(false)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 flex items-center justify-center ${activeCategory === category._id ? 'text-teal-600' : 'text-slate-400'}`}>
                                                                {/* Just a generic icon for now, or fetch icon logic if backend supports it more richly */}
                                                                {category.icon ? <span>{category.icon}</span> : <Zap className="w-5 h-5" />}
                                                            </div>
                                                            <span className={`font-medium ${activeCategory === category._id ? 'text-teal-700' : 'text-slate-700 group-hover:text-teal-700'}`}>
                                                                {category.name}
                                                            </span>
                                                        </div>
                                                        {hasSub && (
                                                            <ChevronRight className={`w-4 h-4 transition-colors ${activeCategory === category._id ? 'text-teal-500' : 'text-gray-300 group-hover:text-teal-500'}`} />
                                                        )}
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic Sub-Menu Panel */}
                                {activeCategory && (
                                    <div className="w-[800px] h-[65vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 p-8 ml-4 relative z-10 animate-in slide-in-from-left-2 duration-200">
                                        <div className="grid grid-cols-3 gap-x-8 gap-y-8">
                                            {getChildren(activeCategory)
                                                .sort((a, b) => {
                                                    const countA = getChildren(a._id).length;
                                                    const countB = getChildren(b._id).length;
                                                    return countB - countA || a.name.localeCompare(b.name);
                                                })
                                                .map((subCat) => {
                                                    const subSubCats = getChildren(subCat._id);
                                                    return (
                                                        <div key={subCat._id} className="break-inside-avoid">
                                                            <Link to={`/category/${subCat.slug}`}>
                                                                <h3 className="text-lg font-bold text-teal-600 mb-3 hover:underline cursor-pointer">
                                                                    {subCat.name}
                                                                </h3>
                                                            </Link>

                                                            {subSubCats.length > 0 && (
                                                                <ul className="space-y-2">
                                                                    {subSubCats.map((child) => (
                                                                        <li key={child._id}>
                                                                            <Link
                                                                                to={`/category/${child.slug}`}
                                                                                className="text-gray-600 hover:text-teal-500 transition-colors text-sm font-medium block"
                                                                                onClick={() => setIsCatalogOpen(false)}
                                                                            >
                                                                                {child.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Search Bar - Modern Gray Background */}
                    <div className="hidden md:flex flex-1 max-w-2xl px-4">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder="Search for premium accessories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-5 pr-14 py-3 bg-gray-100/80 border-2 border-transparent focus:bg-white focus:border-primary-100 rounded-full outline-none transition-all placeholder:text-gray-400 text-gray-700 font-medium"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 w-11 bg-white hover:bg-primary-50 text-primary-600 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        {/* Phone Number - Desktop */}
                        <div className="hidden xl:flex items-center gap-3 text-slate-700">
                            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call Us</span>
                                <span className="text-sm font-bold text-slate-900 whitespace-nowrap">+91 98701 62128</span>
                            </div>
                        </div>

                        {/* Cart - Modern Pill Style */}
                        <Link
                            to="/cart"
                            className="hidden sm:flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                        >
                            <div className="relative p-2">
                                <ShoppingCart className="w-6 h-6 text-slate-700 group-hover:text-primary-600 transition-colors" />
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                                    0
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-slate-400 font-medium">My Cart</span>
                                <span className="text-sm font-bold text-slate-900">₹0.00</span>
                            </div>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Search Bar - Collapsible */}
                <div className="md:hidden pb-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary-100 outline-none"
                        />
                        <button className="absolute right-2 top-2 bottom-2 px-3 bg-white text-primary-600 rounded-lg shadow-sm flex items-center justify-center">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex flex-col space-y-3">
                            {/* Product Catalog Button - Mobile */}
                            <button className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-3 rounded-lg transition-colors">
                                <Menu className="w-5 h-5" />
                                <span className="font-medium">Product Catalog</span>
                            </button>

                            {/* Phone Number - Mobile */}
                            <div className="flex items-center space-x-2 text-gray-700 px-4 py-2">
                                <Phone className="w-5 h-5 text-teal-500" />
                                <span className="text-sm font-semibold">+91 98701 62128</span>
                            </div>

                            {/* Top Nav Items */}
                            <div className="border-t border-gray-200 pt-3 space-y-2">
                                {topNavItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className="block text-gray-600 hover:text-primary-600 transition-colors py-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
