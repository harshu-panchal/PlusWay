import React from 'react';
import { Tag, Zap, Gift, Clock, Sparkles, ChevronRight } from 'lucide-react';

const Promotion = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Active Promotions</h1>
                    <p className="text-lg text-slate-600">Upgrade your tech setup for less. Grab these limited-time deals today.</p>
                </div>

                {/* Main Offer */}
                <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-[32px] p-1 shadow-2xl mb-12 animate-pulse-slow">
                    <div className="bg-white rounded-[30px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-0 opacity-50"></div>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-4 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Summer Sale</span>
                                <span className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                                    <Clock className="w-3 h-3" /> Ends in 3 Days
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">30% OFF on all <span className="text-teal-500 italic">Clear Series</span> Cases</h2>
                            <p className="text-slate-600 text-lg mb-8 max-w-md">Crystal clear protection that never yellows. Grab the best-selling series at its lowest price ever.</p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full hover:bg-teal-600 transition-colors shadow-premium">Shop Now</button>
                                <div className="border-2 border-slate-100 py-4 px-8 rounded-full font-bold text-slate-500 flex items-center gap-2">
                                    Code: <span className="text-slate-900 font-mono tracking-widest underline decoration-teal-500 underline-offset-4 decoration-2">SUMMER30</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-80 h-80 bg-slate-100 rounded-3xl relative z-10 flex items-center justify-center p-8 lg:p-12 overflow-hidden group cursor-pointer">
                            <Sparkles className="absolute top-4 right-4 text-teal-500" />
                            <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="Promo" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="bg-teal-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group cursor-pointer">
                        <Gift className="absolute top-8 right-8 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-2xl font-bold mb-4">Combo Offer</h3>
                        <p className="text-teal-400 mb-8 max-w-xs">Buy any Case + Screen Protector and get a <span className="text-white underline decoration-teal-500">Premium Cable FREE</span>.</p>
                        <button className="flex items-center gap-2 font-bold text-teal-100 group">
                            Explore Combos <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="bg-blue-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group cursor-pointer">
                        <Zap className="absolute top-8 right-8 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                        <h3 className="text-2xl font-bold mb-4">First Order?</h3>
                        <p className="text-blue-400 mb-8 max-w-xs">Use code <span className="text-white underline decoration-teal-500">HELLO10</span> for extra 10% off on your first purchase.</p>
                        <button className="flex items-center gap-2 font-bold text-blue-100 group">
                            Start Shopping <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Newsletter Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Get Early Access to Deals</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Be the first to know about flash sales, new drops, and exclusive discount codes.</p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-200 outline-none focus:border-teal-500 transition-all" />
                        <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/20">Sign Me Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Promotion;
