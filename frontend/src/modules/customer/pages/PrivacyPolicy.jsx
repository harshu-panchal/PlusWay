import { Link } from 'react-router-dom';

const LAST_UPDATED = 'September 21, 2026';

const sections = [
    {
        title: '1. Who we are',
        body: (
            <p>
                PLUSWAY STORE is operated by PLUSWAY RETAIL, Mumbai, Maharashtra, India ("PlusWay", "we", "us").
                This policy explains what personal information we collect through our website and mobile app,
                how we use it, and the choices you have. Questions can be sent to{' '}
                <a href="mailto:support@plusway.com" className="text-teal-600 font-semibold hover:underline">support@plusway.com</a>.
            </p>
        ),
    },
    {
        title: '2. Information we collect',
        body: (
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account details:</strong> your name, email address and password (stored only as a salted hash).</li>
                <li><strong>Delivery details:</strong> the names, phone numbers and addresses you save or enter at checkout.</li>
                <li><strong>Orders and payments:</strong> items purchased, order totals and status, and payment references returned by our payment providers. We never see or store your full card number.</li>
                <li><strong>Activity you create:</strong> wishlist items, cart contents and product reviews.</li>
                <li><strong>Device information:</strong> a push-notification token for your browser or device, only if you allow notifications.</li>
                <li><strong>Preferences:</strong> your selected language, kept on your device.</li>
            </ul>
        ),
    },
    {
        title: '3. How we use your information',
        body: (
            <ul className="list-disc pl-6 space-y-2">
                <li>To create and secure your account and let you sign in.</li>
                <li>To process, deliver and support your orders, returns and warranty claims.</li>
                <li>To send order updates, including push notifications you have allowed.</li>
                <li>To prevent fraud and keep our services secure.</li>
                <li>To meet legal, tax and accounting obligations.</li>
            </ul>
        ),
    },
    {
        title: '4. Who we share it with',
        body: (
            <>
                <p className="mb-3">We do not sell your personal information. We share it only with service providers that help us run the store:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Payment providers</strong> (Razorpay, PayPal) to take payment.</li>
                    <li><strong>Delivery partners</strong> who receive your name, phone number and delivery address to deliver your order.</li>
                    <li><strong>Google Firebase</strong> to deliver push notifications.</li>
                    <li><strong>Hosting and database providers</strong> that store our data securely.</li>
                </ul>
                <p className="mt-3">We may also disclose information when required by law.</p>
            </>
        ),
    },
    {
        title: '5. Data retention',
        body: (
            <p>
                We keep your account data for as long as your account is open. When you delete your account, your profile,
                saved addresses, cart, wishlist and reviews are permanently removed. Order records are retained for the period
                required by Indian tax and accounting law, but are disconnected from your account and your name, phone number
                and address are erased from them once the order is delivered or cancelled.
            </p>
        ),
    },
    {
        title: '6. Your choices and rights',
        body: (
            <>
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        <strong>Delete your account:</strong> open <Link to="/profile" className="text-teal-600 font-semibold hover:underline">Profile</Link> and
                        tap <em>Delete Account</em>. This takes effect immediately.
                    </li>
                    <li><strong>Access or correct your data:</strong> your name and addresses can be viewed and edited in your profile; contact us for anything else.</li>
                    <li><strong>Notifications:</strong> turn push notifications off at any time in your browser or device settings.</li>
                </ul>
                <p className="mt-3">
                    If you cannot sign in, email us from your registered address and we will delete the account for you within 30 days.
                </p>
            </>
        ),
    },
    {
        title: '7. Security',
        body: (
            <p>
                Data is transmitted over HTTPS, passwords are hashed, and access to customer data is limited to authorised staff.
                No system is perfectly secure, so please choose a strong, unique password.
            </p>
        ),
    },
    {
        title: "8. Children",
        body: <p>Our store is not directed at children under 13 and we do not knowingly collect their personal information.</p>,
    },
    {
        title: '9. Changes to this policy',
        body: <p>We may update this policy from time to time. The "last updated" date above shows when it last changed; material changes will be highlighted in the app.</p>,
    },
];

const PrivacyPolicy = () => (
    <div className="mx-4 lg:mx-[10%] py-12 text-slate-800">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mb-10">Last updated: {LAST_UPDATED}</p>

            <div className="space-y-8">
                {sections.map((section) => (
                    <section key={section.title} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">{section.title}</h2>
                        <div className="text-slate-600 leading-relaxed">{section.body}</div>
                    </section>
                ))}
            </div>

            <p className="text-sm text-slate-500 mt-10 text-center">
                Need help? Visit <Link to="/support" className="text-teal-600 font-semibold hover:underline">Support</Link>.
            </p>
        </div>
    </div>
);

export default PrivacyPolicy;
