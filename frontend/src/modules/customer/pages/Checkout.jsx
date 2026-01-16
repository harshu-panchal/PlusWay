import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createOrder, verifyPayment } from '../store/slices/orderSlice';
import Button from '../../../shared/components/ui/Button';
import { Loader2, ShieldCheck, CreditCard, MapPin, CheckCircle } from 'lucide-react';

const loadRazorpay = (src = "https://checkout.razorpay.com/v1/checkout.js") => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalAmount } = useSelector((state) => state.cart);
    const { loading: orderLoading } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.auth);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/addresses', {
                    withCredentials: true
                });
                setSavedAddresses(res.data);

                // Pre-select default address if exists
                const defaultAddr = res.data.find(addr => addr.isDefault);
                if (defaultAddr) {
                    handleAddressSelect(defaultAddr);
                }
            } catch (err) {
                console.error("Failed to fetch addresses", err);
            }
        };
        fetchAddresses();
    }, []);

    const handleAddressSelect = (address) => {
        setSelectedAddressId(address._id);
        setFormData(prev => ({
            ...prev,
            addressLine: address.street,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country
        }));
    };

    // ... (useEffect for items check and handleChange remain same)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ... (handlePayment remains same)

    const handlePayment = async (e) => {
        e.preventDefault();

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        // 1. Create Order on Backend
        const result = await dispatch(createOrder(formData));

        if (createOrder.rejected.match(result)) {
            alert(result.payload || 'Failed to create order');
            return;
        }

        const orderData = result.payload; // { id, razorpayOrderId, amount, keyIdx ... }

        // 2. Open Razorpay
        const options = {
            key: orderData.keyIdx,
            amount: orderData.amount * 100,
            currency: orderData.currency,
            name: "PlusWay E-Commerce",
            description: "Order Payment",
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {
                // 3. Verify Payment
                const verifyResult = await dispatch(verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: orderData.id
                }));

                if (verifyPayment.fulfilled.match(verifyResult)) {
                    navigate('/order-success');
                } else {
                    alert('Payment verification failed');
                }
            },
            prefill: {
                name: formData.fullName,
                contact: formData.phone,
            },
            theme: {
                color: "#14b8a6" // Teal
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    return (
        <div className="mx-4 lg:mx-[10%] py-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-800">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Shipping Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-600" />
                        Shipping Details
                    </h2>

                    {savedAddresses.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Addresses</h3>
                            <div className="grid gap-3">
                                {savedAddresses.map(addr => (
                                    <div
                                        key={addr._id}
                                        onClick={() => handleAddressSelect(addr)}
                                        className={`cursor-pointer border rounded-lg p-3 flex items-start gap-3 transition-all ${selectedAddressId === addr._id
                                            ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                                            : 'border-gray-200 hover:border-teal-200'
                                            }`}
                                    >
                                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr._id ? 'border-teal-600' : 'border-gray-400'
                                            }`}>
                                            {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {addr.city}, {addr.state}
                                                </span>
                                                {addr.isDefault && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">Default</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {addr.street}, {addr.zipCode}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative mt-6 mb-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white text-gray-500">Or enter new address</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                            <input
                                type="text"
                                name="addressLine"
                                required
                                value={formData.addressLine}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Flat / House No. / Street"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    required
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    required
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    readOnly
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-6 rounded-xl h-fit">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                        {items.map(item => (
                            <div key={item._id} className="flex gap-4">
                                <div className="w-16 h-16 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={item.product?.mainImage} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm line-clamp-1">{item.product?.title}</h4>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                        <span className="font-medium text-sm">₹{(item.variant?.price || item.product?.basePrice) * item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span className="text-teal-600">Free</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-800 pt-2">
                            <span>Total</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        form="checkout-form"
                        className="w-full mt-6 py-4 text-lg flex items-center justify-center gap-2"
                        disabled={orderLoading}
                    >
                        {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        {orderLoading ? 'Processing...' : `Pay ₹${totalAmount}`}
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck className="w-4 h-4" />
                        Secure Payment via Razorpay
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Checkout;
