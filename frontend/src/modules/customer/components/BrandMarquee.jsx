import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BrandMarquee = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch(`${API_URL}/brands`);
                if (response.ok) {
                    const data = await response.json();
                    setBrands(data.filter(b => b.isActive));
                }
            } catch (error) {
                console.error('Failed to fetch brands', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBrands();
    }, []);

    if (loading) return null;

    return (
        <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-slate-100 via-white to-blue-100 border-b border-gray-100 overflow-hidden relative">
            {/* Background Gradient Element - Made Stronger */}
            <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal-200/50 via-transparent to-transparent pointer-events-none"></div>

            <div className="mx-4 lg:mx-[10%] mb-6 sm:mb-8 md:mb-10 text-center relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Shop by Brands</h2>
                <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full mx-auto mt-2"></div>
            </div>

            <div className="relative z-10">
                {/* Scrolling Track with CSS Mask for fade effect */}
                {brands.length > 0 ? (
                    <div
                        className="flex w-max gap-8 sm:gap-10 md:gap-12 animate-scroll hover:pause whitespace-nowrap py-3 sm:py-4"
                        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
                    >
                        {/* Duplicate lists: 6 sets to ensure coverage and smooth loop */}
                        {[...Array(6)].map((_, i) => (
                            <React.Fragment key={i}>
                                {brands.map((brand, index) => (
                                    <Link
                                        key={`${brand._id}-${i}-${index}`}
                                        to={`/products?search=${encodeURIComponent(brand.name)}`}
                                        className="inline-flex flex-col items-center justify-center gap-2 group min-w-[100px] sm:min-w-[120px] cursor-pointer"
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-50 flex items-center justify-center p-2 sm:p-3 md:p-4 shadow-sm border border-gray-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105 group-hover:border-teal-200">
                                            <img
                                                src={brand.logo}
                                                alt={brand.name}
                                                className="w-full h-full object-contain transition-all duration-300"
                                            />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-teal-600 transition-colors">
                                            {brand.name}
                                        </span>
                                    </Link>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <p>No brands available</p>
                        <Link to="/admin/brands" className="text-teal-500 text-sm hover:underline">Manage Brands in Admin</Link>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-16.666667%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
};

export default BrandMarquee;
