import { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CategoryIcons = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch root categories or featured ones
                const response = await fetch(`${API_URL}/categories`);
                if (response.ok) {
                    const data = await response.json();
                    // Filter for root categories (level 0) and take first 8 or featured
                    const roots = data.filter(c => c.level === 0).slice(0, 8);
                    setCategories(roots);
                }
            } catch (error) {
                console.error('Failed to fetch categories', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-6 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex-shrink-0 w-28 h-36 bg-gray-100 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className="relative">
            {/* Background handled by parent section */}

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
                {categories.map((category, index) => (
                    <Link
                        to={`/${category.slug}`}
                        key={category._id}
                        className="group flex flex-col items-center gap-3 p-2 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-gradient-to-br from-white to-gray-50 border border-white shadow-sm flex items-center justify-center overflow-hidden group-hover:border-teal-200 group-hover:shadow-inner transition-all duration-500">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-500/0 to-teal-500/0 group-hover:to-teal-500/10 transition-all duration-500" />

                            {category.icon ? (
                                <img
                                    src={category.icon}
                                    alt={category.name}
                                    className="w-16 h-16 object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                />
                            ) : (
                                <Layers className="w-10 h-10 text-slate-300 group-hover:text-teal-500 transition-colors" />
                            )}
                        </div>

                        <div className="text-center">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-teal-600 transition-colors duration-300 leading-tight">
                                {category.name}
                            </h3>
                            {/* Optional: Add product count if available */}
                            {/* <span className="text-[10px] text-slate-400 group-hover:text-slate-500 transition-colors">Explore</span> */}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryIcons;
