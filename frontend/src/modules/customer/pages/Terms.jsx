import { Link } from 'react-router-dom';

const LAST_UPDATED = 'September 21, 2026';

const sections = [
    {
        title: '1. Acceptance of terms',
        body: 'By creating an account or placing an order with PLUSWAY STORE (operated by PLUSWAY RETAIL, Mumbai, India), you agree to these terms. If you do not agree, please do not use the store.',
    },
    {
        title: '2. Your account',
        body: 'You are responsible for the accuracy of the information you provide and for keeping your password confidential. You can delete your account at any time from the Profile page.',
    },
    {
        title: '3. Products, pricing and availability',
        body: 'We make every effort to display products, prices and stock accurately. Prices are in Indian Rupees unless stated otherwise. We may correct errors, and may cancel an order affected by a pricing or stock error, in which case you will be refunded in full.',
    },
    {
        title: '4. Orders and payment',
        body: 'An order is confirmed once payment succeeds. Payments are processed securely by our third-party providers; we do not store your card details.',
    },
    {
        title: '5. Shipping and returns',
        body: 'Delivery timelines and charges are described on the Shipping & Delivery page. Warranty terms are described on the Warranty Policy page. Nothing in these terms limits your statutory consumer rights.',
    },
    {
        title: '6. Acceptable use',
        body: 'You agree not to misuse the store, attempt to gain unauthorised access, submit false reviews, or use it for unlawful purposes. We may suspend accounts that breach these terms.',
    },
    {
        title: '7. Limitation of liability',
        body: 'To the extent permitted by law, PLUSWAY RETAIL is not liable for indirect or consequential losses arising from your use of the store. Our total liability for any order is limited to the amount you paid for it.',
    },
    {
        title: '8. Governing law',
        body: 'These terms are governed by the laws of India, and the courts of Mumbai, Maharashtra have jurisdiction over any dispute.',
    },
    {
        title: '9. Contact',
        body: 'Questions about these terms can be sent to plusway9@gmail.com.',
    },
];

const Terms = () => (
    <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-slate-500 mb-10">Last updated: {LAST_UPDATED}</p>

            <div className="space-y-8">
                {sections.map((section) => (
                    <section key={section.title} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">{section.title}</h2>
                        <p className="text-slate-600 leading-relaxed">{section.body}</p>
                    </section>
                ))}
            </div>

            <p className="text-sm text-slate-500 mt-10 text-center">
                See also our <Link to="/privacy" className="text-teal-600 font-semibold hover:underline">Privacy Policy</Link>.
            </p>
        </div>
    </div>
);

export default Terms;
