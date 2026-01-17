import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="mx-4 sm:mx-[10%] py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {/* About */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">About PlusWay</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">
                            Your one-stop shop for premium mobile phone accessories. Quality products at affordable prices.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-400 hover:text-white transition-colors">
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                                    My Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li className="text-gray-400">Contact Us</li>
                            <li className="text-gray-400">Shipping Policy</li>
                            <li className="text-gray-400">Return Policy</li>
                            <li className="text-gray-400">FAQs</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-center sm:text-left">
                        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h3>
                        <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                            <li>Email: support@plusway.com</li>
                            <li>Phone: +91 1234567890</li>
                            <li>Address: Mumbai, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} PlusWay. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
