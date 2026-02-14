import React from 'react';
import { FileText, Download, Printer, Search, HelpCircle, ArrowRight } from 'lucide-react';

const Receipts = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Receipts & Invoices</h1>
                    <p className="text-lg text-slate-600">Manage your order documentation and tax invoices with ease.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-full bg-teal-500"></div>
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                            <Download className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Download Invoices</h3>
                        <p className="text-slate-600 leading-relaxed text-sm mb-6">Access and download PDF receipts for all your past purchases from your profile's order history.</p>
                        <button className="flex items-center gap-2 text-teal-600 font-bold text-sm">
                            Go to Orders <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">GST Invoices</h3>
                        <p className="text-slate-600 leading-relaxed text-sm mb-6">Require a business invoice with GST details? Simply add your GSTIN during checkout or update it in your profile.</p>
                        <button className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            Edit Profile <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <HelpCircle className="text-teal-500" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-8">
                        <div>
                            <h4 className="font-bold text-slate-200 mb-2">When will I receive my receipt?</h4>
                            <p className="text-slate-400 text-sm">A digital receipt is sent to your registered email immediately after payment. A physical invoice is included inside your delivery package.</p>
                        </div>
                        <div className="border-t border-white/5 pt-8">
                            <h4 className="font-bold text-slate-200 mb-2">Can I update my billing info after purchase?</h4>
                            <p className="text-slate-400 text-sm">No, once an order is processed, billing information cannot be changed. Please ensure all details are correct at checkout.</p>
                        </div>
                        <div className="border-t border-white/5 pt-8">
                            <h4 className="font-bold text-slate-200 mb-2">Lost your email receipt?</h4>
                            <p className="text-slate-400 text-sm italic">"Don't worry. All your receipts are permanently stored in your account dashboard for easy retrieval."</p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-slate-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200">
                    <div className="flex items-center gap-4">
                        <Printer className="w-8 h-8 text-slate-400" />
                        <div>
                            <h4 className="font-bold">Need a hard copy?</h4>
                            <p className="text-sm text-slate-500">You can print your digital invoice anytime directly from your dashboard.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-sm">
                        Visit Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Receipts;
