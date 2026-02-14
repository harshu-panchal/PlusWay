import React from 'react';
import { Users, Handshake, TrendingUp, ShieldCheck } from 'lucide-react';

const Partners = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Partner with PlusWay</h1>
                    <p className="text-lg text-slate-600">Join our ecosystem and grow your business with premium mobile accessories.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                            <Handshake className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Retail Partnerships</h3>
                        <p className="text-slate-600 leading-relaxed">Become an authorized regional distributor or retail partner and get access to exclusive wholesale pricing and marketing support.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Affiliate Program</h3>
                        <p className="text-slate-600 leading-relaxed">Earn competitive commissions by promoting PlusWay products through your content, social media, or website.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Corporate Gifting</h3>
                        <p className="text-slate-600 leading-relaxed">Bulk orders for corporate events, employee rewards, and promotional gifts with customization options.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Quality Assurance</h3>
                        <p className="text-slate-600 leading-relaxed">We stand by our partners with guaranteed product quality and reliable supply chain management.</p>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">Ready to Collaborate?</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Send us your business details and requirements, and our partnership team will get back to you within 24-48 hours.</p>
                    <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg shadow-teal-500/20">
                        Contact Partner Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Partners;
