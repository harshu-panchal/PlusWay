import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroCarousel from '../components/HeroCarousel';
import CategoryIcons from '../components/CategoryIcons';
import ProductCard from '../components/ProductCard';
import BrandMarquee from '../components/BrandMarquee';
import DealOfTheDay from '../components/DealOfTheDay';
import ProductRow from '../components/ProductRow';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Home = () => {
    const [sideBanner, setSideBanner] = useState(null);
    const [promoBanners, setPromoBanners] = useState([]);

    // Data States
    const [bestSellers, setBestSellers] = useState({ data: [], loading: true });
    const [newArrivals, setNewArrivals] = useState({ data: [], loading: true });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [sideRes, gridRes, prodRes, newRes] = await Promise.all([
                    fetch(`${API_URL}/banners?position=side`),
                    fetch(`${API_URL}/banners?position=bottom-grid`),
                    fetch(`${API_URL}/products?limit=8&isFeatured=true`),
                    fetch(`${API_URL}/products?limit=8&isNewArrival=true&sort=newest`)
                ]);

                if (sideRes.ok) {
                    const data = await sideRes.json();
                    if (data && data.length > 0) setSideBanner(data[0]);
                }

                if (gridRes.ok) {
                    const data = await gridRes.json();
                    setPromoBanners(data);
                }

                if (prodRes.ok) {
                    const data = await prodRes.json();
                    setBestSellers({ data: data.products || [], loading: false });
                }

                if (newRes.ok) {
                    const data = await newRes.json();
                    setNewArrivals({ data: data.products || [], loading: false });
                }

            } catch (error) {
                console.error("Home page data fetch error:", error);
                setBestSellers(prev => ({ ...prev, loading: false }));
                setNewArrivals(prev => ({ ...prev, loading: false }));
            }
        };
        fetchData();
    }, []);

    const FeatureItem = ({ icon, title, desc }) => (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-300">
            <div className="text-4xl">{icon}</div>
            <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-0.5">{title}</h3>
                <p className="text-slate-500 text-xs">{desc}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* 1. Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="pt-2 sm:pt-6"
            >
                <div className="container mx-auto px-4 lg:px-[10%]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 xl:col-span-9">
                            <HeroCarousel />
                        </div>
                        <div className="lg:col-span-4 xl:col-span-3 hidden lg:block">
                            <div className="h-full rounded-[32px] overflow-hidden relative group shadow-premium">
                                <img src={sideBanner?.image || "https://images.unsplash.com/photo-1616410011236-7a4211f90103?auto=format&fit=crop&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-8 flex flex-col justify-end">
                                    <h3 className="text-white text-2xl font-black leading-tight mb-2 tracking-tight whitespace-pre-line">{sideBanner?.title || 'Premium\nAudio'}</h3>
                                    <p className="text-slate-300 text-xs mb-6 font-medium">{sideBanner?.subtitle || 'Limited time offer'}</p>
                                    <Link to="/products" className="bg-white text-slate-900 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-center hover:bg-teal-500 hover:text-white transition-all shadow-xl">Shop Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 2. Trust Signals */}
            <section className="py-8">
                <div className="container mx-auto px-4 lg:px-[10%]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <FeatureItem icon="🚚" title="Fast Shipping" desc="Express delivery across India" />
                        <FeatureItem icon="🛡️" title="Verified Store" desc="100% Genuine products" />
                        <FeatureItem icon="↩️" title="Easy Returns" desc="7-day hassle-free returns" />
                    </div>
                </div>
            </section>

            {/* 3. Category Icons (Clean Row) */}
            <section className="relative py-8 mb-6 overflow-hidden">
                {/* Dynamic Mesh Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 opacity-80"></div>
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[40rem] h-[40rem] bg-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-[20%] -right-[10%] w-[35rem] h-[35rem] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-[20%] left-[20%] w-[45rem] h-[45rem] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <style>{`
                    @keyframes blob {
                        0% { transform: translate(0px, 0px) scale(1); }
                        33% { transform: translate(30px, -50px) scale(1.1); }
                        66% { transform: translate(-20px, 20px) scale(0.9); }
                        100% { transform: translate(0px, 0px) scale(1); }
                    }
                    .animate-blob {
                        animation: blob 7s infinite;
                    }
                    .animation-delay-2000 {
                        animation-delay: 2s;
                    }
                    .animation-delay-4000 {
                        animation-delay: 4s;
                    }
                `}</style>

                <div className="relative mx-4 lg:mx-[10%] z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Popular Categories</h2>
                            <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mt-1"></div>
                        </div>
                        <Link to="/products" className="group flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors bg-white/50 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm border border-white/50 shadow-sm hover:shadow-md">
                            View All
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </Link>
                    </div>
                    <CategoryIcons />
                </div>
            </section>

            {/* 4. New Arrivals (Horizontal Scroll) */}
            <ProductRow
                title="New Arrivals"
                products={newArrivals.data}
                loading={newArrivals.loading}
                link="/products?isNewArrival=true&sort=newest"
            />

            {/* 5. Deal of the Day (Promotional Block) */}
            <DealOfTheDay />

            {/* 6. Shop by Brands (Marquee) */}
            <BrandMarquee />

            {/* 7. Featured Products (Grid) */}
            <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
                <div className="mx-4 lg:mx-[10%]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 md:mb-10 gap-3">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Featured Products</h2>
                            <div className="h-1 w-16 sm:w-20 bg-teal-500 rounded-full"></div>
                        </div>
                        <Link to="/products?isFeatured=true" className="hidden md:flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group">
                            See All Products
                            <span className="group-hover:translate-x-1 transition-transform ml-1">→</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {bestSellers.loading ? (
                            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse"></div>
                            ))
                        ) : bestSellers.data.length > 0 ? (
                            bestSellers.data.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                Check back soon for featured items!
                            </div>
                        )}
                    </div>

                    <Link to="/products?isFeatured=true" className="md:hidden w-full mt-8 flex items-center justify-center bg-white border border-gray-200 text-slate-700 py-3 rounded-xl font-medium">
                        View More
                    </Link>
                </div>
            </section>

            {/* 8. Promotional Banners (Grid) */}
            {promoBanners.length > 0 && (
                <section className="py-8 sm:py-12 md:py-16 bg-white">
                    <div className="mx-4 lg:mx-[10%]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {promoBanners.slice(0, 2).map((banner) => (
                                <Link to={banner.link} key={banner._id} className="relative h-[200px] sm:h-[240px] md:h-[280px] rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer isolate shadow-md hover:shadow-xl transition-shadow duration-300">
                                    <div className="absolute inset-0">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                    </div>
                                    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 drop-shadow-md">{banner.title}</h3>
                                        <span className="inline-flex items-center justify-center bg-white text-slate-900 px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full font-bold text-xs tracking-wider uppercase hover:bg-teal-500 hover:text-white transition-colors duration-300">
                                            Shop Now
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 9. Newsletter Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-slate-900 relative overflow-hidden isolate">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-teal-900/20 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] -z-10"></div>

                <div className="mx-4 lg:mx-[10%] relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-teal-500 font-bold tracking-widest uppercase text-xs mb-2 block">Stay Connected</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">Join the PlusWay Family</h2>
                        <p className="text-slate-400 mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg leading-relaxed px-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals sent directly to your inbox.</p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto px-4">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm transition-all focus:bg-white/10 text-sm sm:text-base"
                            />
                            <button className="px-6 sm:px-8 py-3 sm:py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base min-h-[48px]">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-slate-600 text-xs mt-4 sm:mt-6">We respect your privacy. Unsubscribe at any time.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

