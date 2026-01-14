import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">About AppZeto</h3>
                        <p className="text-gray-400 text-sm">
                            Your one-stop shop for premium mobile phone accessories. Quality products at affordable prices.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
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
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-gray-400">Contact Us</li>
                            <li className="text-gray-400">Shipping Policy</li>
                            <li className="text-gray-400">Return Policy</li>
                            <li className="text-gray-400">FAQs</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email: support@appzeto.com</li>
                            <li>Phone: +91 1234567890</li>
                            <li>Address: Mumbai, India</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} AppZeto. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
