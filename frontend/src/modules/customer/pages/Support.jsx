import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, MapPin, ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'How do I track my order?',
        a: <>Sign in and open <Link to="/orders" className="text-teal-600 font-semibold hover:underline">My Orders</Link> to see the live status of every order.</>,
    },
    {
        q: 'How long does delivery take?',
        a: <>Delivery times depend on your location. See <Link to="/delivery-payment" className="text-teal-600 font-semibold hover:underline">Shipping & Delivery</Link> for details.</>,
    },
    {
        q: 'My product is faulty. What can I do?',
        a: <>Our <Link to="/warranty" className="text-teal-600 font-semibold hover:underline">Warranty Policy</Link> covers manufacturing defects. Email us your order number and photos and we will arrange a replacement or refund.</>,
    },
    {
        q: 'I forgot my password.',
        a: 'Email support@plusway.com from your registered address and we will help you regain access.',
    },
    {
        q: 'How do I delete my account?',
        a: <>Go to <Link to="/profile" className="text-teal-600 font-semibold hover:underline">Profile</Link> and tap <em>Delete Account</em>. You will be asked for your password to confirm. If you cannot sign in, email us and we will delete it within 30 days.</>,
    },
    {
        q: 'How is my personal data handled?',
        a: <>Read our <Link to="/privacy" className="text-teal-600 font-semibold hover:underline">Privacy Policy</Link>.</>,
    },
];

const Support = () => (
    <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Help & Support</h1>
                <p className="text-lg text-slate-600">We're here to help with orders, deliveries, warranty and your account.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <Mail className="w-6 h-6 text-blue-600 mb-3" />
                    <h3 className="font-bold mb-1">Email</h3>
                    <a href="mailto:support@plusway.com" className="text-blue-600 font-semibold hover:underline">support@plusway.com</a>
                    <p className="text-sm text-slate-500 mt-1">We reply within 24 hours.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <Phone className="w-6 h-6 text-teal-600 mb-3" />
                    <h3 className="font-bold mb-1">Phone</h3>
                    <a href="tel:+919870162128" className="text-teal-600 font-semibold hover:underline">+91 98701 62128</a>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Mon-Sat, 10AM - 7PM</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
            <div className="space-y-3 mb-12">
                {faqs.map((item) => (
                    <details key={item.q} className="group bg-white rounded-xl border border-slate-100 shadow-sm">
                        <summary className="flex items-center justify-between cursor-pointer list-none px-5 py-4 font-semibold text-slate-900">
                            {item.q}
                            <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-5 pb-4 text-slate-600 leading-relaxed">{item.a}</div>
                    </details>
                ))}
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-start gap-4">
                <MapPin className="w-6 h-6 text-teal-500 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold mb-1">PLUSWAY RETAIL</h3>
                    <p className="text-slate-300 text-sm">Mumbai, Maharashtra, India</p>
                    <p className="text-slate-400 text-sm mt-3">
                        <Link to="/privacy" className="hover:text-white underline">Privacy Policy</Link>
                        {' · '}
                        <Link to="/terms" className="hover:text-white underline">Terms of Service</Link>
                        {' · '}
                        <Link to="/contacts" className="hover:text-white underline">Contact form</Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
);

export default Support;
