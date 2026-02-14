import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
            <div className="container mx-auto px-4 lg:px-[10%] py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-black text-xl">P</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">PLUSWAY</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Elevating your mobile experience with premium accessories designed for style and durability.
                        </p>
                    </div>

                    {/* Quick Explore */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Explore</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/products" className="hover:text-teal-400 transition-colors">All Products</Link></li>
                            <li><Link to="/news" className="hover:text-teal-400 transition-colors">Latest News</Link></li>
                            <li><Link to="/promotion" className="hover:text-teal-400 transition-colors">Promotion</Link></li>
                            <li><Link to="/partners" className="hover:text-teal-400 transition-colors">Partnership</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Help & Support</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/delivery-payment" className="hover:text-teal-400 transition-colors">Shipping & Delivery</Link></li>
                            <li><Link to="/warranty" className="hover:text-teal-400 transition-colors">Warranty Policy</Link></li>
                            <li><Link to="/contacts" className="hover:text-teal-400 transition-colors">Contact Support</Link></li>
                            <li><Link to="/receipts" className="hover:text-teal-400 transition-colors">Invoices & Receipts</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Connect</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <span className="text-white font-medium">+91 98701 62128</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span>support@plusway.com</span>
                            </li>
                            <li>
                                <p className="leading-relaxed">Mumbai, Maharashtra, India</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs tracking-wide">
                        &copy; {new Date().getFullYear()} PLUSWAY STORE. OPERATED BY PLUSWAY RETAIL.
                    </p>
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
