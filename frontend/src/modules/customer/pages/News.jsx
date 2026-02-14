import React from 'react';
import { Calendar, Tag, Zap, ArrowRight } from 'lucide-react';

const News = () => {
    const articles = [
        {
            id: 1,
            category: 'Launch',
            title: 'New Titanium Series Cases Now Available',
            excerpt: 'Our most durable cases yet, designed specifically for the latest iPhone models with aerospace-grade titanium accents.',
            date: 'May 15, 2024',
            image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: 2,
            category: 'Innovation',
            title: 'The Future of Charging: MagClick Gen 3',
            excerpt: 'Introducing the third generation of our magnetic charging tech, now 40% faster and with improved thermal management.',
            date: 'May 10, 2024',
            image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'
        },
        {
            id: 3,
            category: 'Sustainability',
            title: 'PlusWay Eco-Friendly Packaging Initiative',
            excerpt: 'We are proud to announce that 100% of our packaging is now made from recycled materials and is fully compostable.',
            date: 'May 5, 2024',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'
        }
    ];

    return (
        <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">PlusWay News</h1>
                        <p className="text-lg text-slate-600 max-w-xl">Stay updated with the latest product launches, tech insights, and company updates.</p>
                    </div>
                    <div className="flex gap-2">
                        {['All', 'Launch', 'Reviews', 'Insight'].map(tab => (
                            <button key={tab} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Post */}
                <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-16 group cursor-pointer shadow-2xl">
                    <img src={articles[0].image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Featured" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-3xl">
                        <span className="inline-block px-4 py-1.5 bg-teal-500 text-white text-xs font-black uppercase tracking-widest rounded-full mb-4">Latest Release</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">{articles[0].title}</h2>
                        <div className="flex items-center gap-6 text-slate-300 text-sm font-bold">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-teal-500" />
                                {articles[0].date}
                            </span>
                            <span className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-teal-500" />
                                {articles[0].category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.slice(1).map(article => (
                        <div key={article.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={article.title} />
                                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {article.category}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                                    <Calendar className="w-3 h-3" />
                                    {article.date}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{article.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">{article.excerpt}</p>
                                <button className="flex items-center gap-2 text-teal-600 font-bold text-sm group/btn">
                                    Read More
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Subscription Card */}
                    <div className="bg-slate-900 rounded-2xl p-8 flex flex-col justify-center text-white relative overflow-hidden group">
                        <Zap className="absolute -top-4 -right-4 w-24 h-24 text-teal-500/10 rotate-12" />
                        <h3 className="text-2xl font-bold mb-4 relative z-10">Don't miss a beat.</h3>
                        <p className="text-slate-400 text-sm mb-8 relative z-10">Subscribe to our newsletter and get exclusive tech news and early access to promotions.</p>
                        <div className="space-y-4 relative z-10">
                            <input type="email" placeholder="Email address" className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/10 outline-none focus:border-teal-500 transition-colors" />
                            <button className="w-full bg-teal-500 py-3 rounded-xl font-bold hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20">Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default News;
