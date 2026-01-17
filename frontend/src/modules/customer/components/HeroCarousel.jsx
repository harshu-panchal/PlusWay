import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_URL}/banners?position=hero`);
                if (response.ok) {
                    setBanners(await response.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    // Fallback if no banners
    const displayBanners = banners.length > 0 ? banners : [
        {
            _id: 'default',
            title: 'Welcome to PlusWay',
            subtitle: 'Premium Mobile Accessories',
            image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&h=400&fit=crop',
            bgColor: 'from-cyan-400 to-cyan-600',
            link: '/products'
        }
    ];

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || displayBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, displayBanners.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    if (loading) return <div className="h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px] bg-gray-100 rounded-xl animate-pulse"></div>;

    return (
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-xl shadow-lg group">
            {/* Slides */}
            <div className="relative w-full h-full">
                {displayBanners.map((banner, index) => (
                    <div
                        key={banner._id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                            ? 'opacity-100 translate-x-0'
                            : index < currentSlide
                                ? 'opacity-0 -translate-x-full'
                                : 'opacity-0 translate-x-full'
                            }`}
                    >
                        <div className="w-full h-full relative">
                            {/* Full Banner Image */}
                            <img
                                src={banner.image}
                                alt={banner.title || 'Banner'}
                                className="w-full h-full object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                            />

                            {/* Shop Now Button */}
                            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-12 lg:left-16">
                                <Link to={banner.link || '/products'} className="inline-block bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {displayBanners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Dots Navigation */}
                    <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {displayBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full ${index === currentSlide
                                    ? 'bg-white w-8 h-2'
                                    : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default HeroCarousel;
