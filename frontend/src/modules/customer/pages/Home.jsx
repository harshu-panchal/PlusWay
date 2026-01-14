import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HeroCarousel from '../components/HeroCarousel';
import CategoryIcons from '../components/CategoryIcons';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [sideBanner, setSideBanner] = useState(null);
    const [promoBanners, setPromoBanners] = useState([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                // Fetch Side Banner
                const sideRes = await fetch('http://localhost:5000/api/banners?position=side');
                if (sideRes.ok) {
                    const data = await sideRes.json();
                    if (data.length > 0) setSideBanner(data[0]);
                }

                // Fetch Bottom Grid Banners
                const gridRes = await fetch('http://localhost:5000/api/banners?position=bottom-grid');
                if (gridRes.ok) {
                    const data = await gridRes.json();
                    setPromoBanners(data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchBanners();
    }, []);

    return (
        <div className="bg-gray-50">
            {/* Hero Carousel Section */}
            <section className="mx-4 lg:mx-[10%] pt-6 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Carousel - 75% width on desktop */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <HeroCarousel />
                    </div>

                    {/* Side Banner - 25% width on desktop */}
                    <div className="lg:col-span-4 xl:col-span-3 hidden lg:block">
                        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg group cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900">
                                {/* Background Image */}
                                <img
                                    src={sideBanner?.image || "https://images.unsplash.com/photo-1616410011236-7a4211f90103?w=800&h=600&fit=crop"}
                                    alt={sideBanner?.title || "AppZeto Premium"}
                                    className="w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"
                                />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                                    <div className="mb-4">
                                        <h2 className="text-4xl font-bold tracking-tight mb-1">{sideBanner?.title || 'AppZeto'}</h2>
                                        <span className="text-xs uppercase tracking-[0.3em] opacity-80">{sideBanner?.subtitle || 'Original'}</span>
                                    </div>

                                    {!sideBanner && (
                                        <div className="relative w-48 h-48 my-4">
                                            <img
                                                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=contain"
                                                alt="Headphones"
                                                className="w-full h-full object-contain drop-shadow-2xl animate-fade-in-up"
                                            />
                                        </div>
                                    )}

                                    <Link to={sideBanner?.link || '/products'} className="mt-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-2 rounded-full font-medium hover:bg-white hover:text-purple-900 transition-all duration-300">
                                        View Collection
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Icons Section */}
            <section className="bg-white pt-10 pb-12 border-b border-gray-100">
                <div className="mx-4 lg:mx-[10%]">
                    <CategoryIcons />
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-gray-50/50">
                <div className="mx-4 lg:mx-[10%]">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Best Sellers</h2>
                            <div className="h-1 w-20 bg-teal-500 rounded-full"></div>
                        </div>
                        <button className="hidden md:flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors group">
                            View Collection
                            <span className="group-hover:translate-x-1 transition-transform ml-1">→</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <ProductCard key={item} id={item} />
                        ))}
                    </div>

                    <button className="md:hidden w-full mt-8 bg-white border border-gray-200 text-slate-700 py-3 rounded-xl font-medium">
                        View All Products
                    </button>
                </div>
            </section>

            {/* Promotional Banner Section */}
            {promoBanners.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="mx-4 lg:mx-[10%]">
                        <div className="grid md:grid-cols-2 gap-8">
                            {promoBanners.slice(0, 2).map((banner) => (
                                <Link to={banner.link} key={banner._id} className="relative h-[300px] rounded-2xl overflow-hidden group cursor-pointer isolate">
                                    <div className="absolute inset-0 bg-gray-900">
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="relative h-full flex flex-col justify-center px-10 text-white">
                                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full w-fit mb-4">
                                            {banner.isActive ? 'Featured' : 'Promo'}
                                        </span>
                                        <h3 className="text-4xl font-bold mb-2 tracking-tight">{banner.title}</h3>
                                        <p className="text-gray-200 mb-8 max-w-md text-lg">{banner.subtitle}</p>
                                        <span className="text-white font-bold tracking-wide border-b-2 border-white pb-1 w-fit hover:border-teal-400 hover:text-teal-400 transition-colors">
                                            SHOP NOW
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Newsletter Section */}
            <section className="py-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-800 to-transparent"></div>
                <div className="mx-4 lg:mx-[10%] relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Join the AppZeto Family</h2>
                        <p className="text-slate-400 mb-8 text-lg">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm"
                            />
                            <button className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-teal-500/25">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-slate-500 text-sm mt-4">No spam, just tech updates.</p>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="py-10 border-t border-gray-100 bg-white">
                <div className="mx-4 lg:mx-[10%]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="flex items-center justify-center gap-4 py-4 md:py-0">
                            <span className="text-4xl">🚚</span>
                            <div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Free Shipping</h3>
                                <p className="text-slate-500 text-xs mt-1">On all orders over ₹499</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-4 md:py-0">
                            <span className="text-4xl">🛡️</span>
                            <div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Secure Payment</h3>
                                <p className="text-slate-500 text-xs mt-1">100% protected transactions</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-4 md:py-0">
                            <span className="text-4xl">↩️</span>
                            <div>
                                <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Easy Returns</h3>
                                <p className="text-slate-500 text-xs mt-1">30-day money back guarantee</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
