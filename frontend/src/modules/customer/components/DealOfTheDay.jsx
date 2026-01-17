import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer } from 'lucide-react';
// import { differenceInSeconds } from 'date-fns'; // Removed unused dependency

const API_Base_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DealOfTheDay = () => {
    const [deal, setDeal] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                const res = await fetch(`${API_Base_URL}/deals/active`);
                if (res.ok) {
                    const data = await res.json();
                    setDeal(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDeal();
    }, []);

    useEffect(() => {
        if (!deal) return;

        const interval = setInterval(() => {
            const now = new Date();
            const end = new Date(deal.endDate);
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24) + Math.floor(diff / (1000 * 60 * 60 * 24)) * 24; // Total hours including days
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [deal]);

    const TimeBox = ({ value, label }) => (
        <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1.5 sm:p-2 min-w-[45px] sm:min-w-[50px] md:min-w-[60px]">
            <span className="text-lg sm:text-xl font-bold text-white">{String(value).padStart(2, '0')}</span>
            <span className="text-[9px] uppercase tracking-wider text-teal-100">{label}</span>
        </div>
    );

    if (loading || !deal) return null; // Don't show if no active deal

    return (
        <section className="my-6 sm:my-8 mx-4 lg:mx-[10%] rounded-2xl overflow-hidden relative isolate bg-slate-900">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[300px] h-[300px] bg-teal-600/30 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[250px] h-[250px] bg-purple-600/30 rounded-full blur-[80px] -z-10"></div>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 p-4 sm:p-6 md:p-10 items-center justify-between">
                {/* Content */}
                <div className="order-2 md:order-1 text-center md:text-left flex-1 max-w-full md:max-w-md shrink-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider mb-4">
                        <Timer className="w-3.5 h-3.5" /> Deal of the Day
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 leading-tight line-clamp-2">
                        {deal.title}
                    </h2>

                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                        <span className="text-2xl sm:text-3xl font-bold text-teal-400">₹{deal.dealPrice.toLocaleString()}</span>
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-sm text-slate-400 line-through">₹{deal.originalPrice.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-red-400">Save {deal.discount}%</span>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                        <TimeBox value={timeLeft.hours} label="Hrs" />
                        <TimeBox value={timeLeft.minutes} label="Mins" />
                        <TimeBox value={timeLeft.seconds} label="Secs" />
                    </div>

                    <Link
                        to={`/product/${deal.product?.slug || deal.product?._id}`} // Adjust based on populated product
                        className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-sm transition-all shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 min-h-[44px]"
                    >
                        Shop Now
                    </Link>
                </div>

                {/* Images - Row of 3, hide 3rd on mobile */}
                <div className="order-1 md:order-2 flex gap-3 sm:gap-4 w-full justify-center md:justify-end">
                    {deal.images.slice(0, 2).map((img, index) => (
                        <div key={index} className={`relative rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300 ${index === 1 ? 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 z-10 -mt-4' : 'w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 opacity-80 hover:opacity-100'}`}>
                            <img
                                src={img}
                                alt={`View ${index + 1}`}
                                className="w-full h-full object-contain p-2"
                                loading="lazy"
                            />
                        </div>
                    ))}
                    {/* Third image - hidden on mobile */}
                    {deal.images[2] && (
                        <div className="hidden sm:block relative rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-xl transition-transform hover:scale-105 duration-300 w-28 h-28 md:w-36 md:h-36 opacity-80 hover:opacity-100">
                            <img
                                src={deal.images[2]}
                                alt="View 3"
                                className="w-full h-full object-contain p-2"
                                loading="lazy"
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default DealOfTheDay;
