import React from 'react';
import { Truck, CreditCard, Clock, MapPin, ShieldCheck, Wallet } from 'lucide-react';

const DeliveryPayment = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Delivery & Payment</h1>
                    <p className="text-lg text-slate-600">Fast shipping and secure payment options for a seamless shopping experience.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Delivery Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-teal-50 rounded-xl">
                                <Truck className="w-6 h-6 text-teal-600" />
                            </div>
                            <h2 className="text-2xl font-bold">Delivery Information</h2>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex gap-4">
                                <Clock className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Processing Time</h4>
                                    <p className="text-sm text-slate-600">Orders are processed within 24 hours of confirmation (Monday-Saturday).</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <MapPin className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Shipping Costs</h4>
                                    <p className="text-sm text-slate-600">Free delivery on orders above ₹499. Standard shipping fee applies to smaller orders.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <ShieldCheck className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Tracking</h4>
                                    <p className="text-sm text-slate-600">Real-time tracking available via our app and email notifications once Shipped.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
                            <h4 className="font-bold text-teal-900 mb-2">Estimated Arrival</h4>
                            <p className="text-sm text-teal-700">Metro Cities: 2-3 Business Days<br />Rest of India: 4-6 Business Days</p>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold">Payment Methods</h2>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div className="flex gap-4">
                                <Wallet className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Online Payment</h4>
                                    <p className="text-sm text-slate-600">Secure payments via Razorpay (UPI, Credit/Debit Cards, Net Banking).</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <CreditCard className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Digital Wallets</h4>
                                    <p className="text-sm text-slate-600">Pay using popular wallets like Paytm, PhonePe, and Google Pay.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <ShieldCheck className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-900">Secure Transactions</h4>
                                    <p className="text-sm text-slate-600">All transactions are encrypted and processed through industry-leading payment gateways.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">Cash on Delivery (COD)</h4>
                            <p className="text-sm text-blue-700">Available for select pin codes with a nominal convenience fee.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryPayment;
