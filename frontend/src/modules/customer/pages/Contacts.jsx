import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Instagram, Facebook, Twitter } from 'lucide-react';

const Contacts = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Get in Touch</h1>
                    <p className="text-lg text-slate-600">Have questions? We're here to help you find the perfect accessories.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Contact Cards */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center group hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Call Us</h3>
                        <p className="text-slate-500 mb-4 text-sm">Mon-Sat: 10AM - 7PM</p>
                        <a href="tel:+919870162128" className="text-teal-600 font-bold hover:underline">+91 98701 62128</a>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center group hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Email Support</h3>
                        <p className="text-slate-500 mb-4 text-sm">24/7 Response time</p>
                        <a href="mailto:support@plusway.com" className="text-blue-600 font-bold hover:underline">support@plusway.com</a>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center group hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Live Chat</h3>
                        <p className="text-slate-500 mb-4 text-sm">Instant support</p>
                        <button className="text-purple-600 font-bold hover:underline">Start Conversation</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    {/* Contact Form */}
                    <div className="p-8 md:p-12">
                        <h2 className="text-2xl font-bold mb-8">Send a Message</h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email</label>
                                    <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Subject</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all" placeholder="How can we help?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Message</label>
                                <textarea rows="4" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white outline-none transition-all resize-none" placeholder="Your message here..."></textarea>
                            </div>
                            <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Store Info */}
                    <div className="bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-8">Store Location</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <MapPin className="w-6 h-6 text-teal-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold mb-1">Main Store & Office</h4>
                                        <p className="text-slate-400 text-sm">Shop No. 12, PlusWay Heights, Near Metro Mall, Mumbai, Maharashtra 400001, India</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Clock className="w-6 h-6 text-teal-500 shrink-0" />
                                    <div>
                                        <h4 className="font-bold mb-1">Business Hours</h4>
                                        <p className="text-slate-400 text-sm">Mon - Fri: 10:00 AM - 8:00 PM<br />Sat: 10:00 AM - 6:00 PM<br />Sun: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12">
                            <h4 className="font-bold mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-teal-500 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;
