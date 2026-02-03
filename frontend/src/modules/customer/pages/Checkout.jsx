import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createOrder, verifyPayment } from '../store/slices/orderSlice';
import Button from '../../../shared/components/ui/Button';
import { Loader2, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, totalAmount } = useSelector((state) => state.cart);
    const { loading: orderLoading } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.auth);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isOrderCreated, setIsOrderCreated] = useState(false);
    const [paypalOrderId, setPaypalOrderId] = useState(null);
    const [dbOrderId, setDbOrderId] = useState(null);

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
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/addresses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSavedAddresses(res.data);

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
        currency: "USD",
        intent: "capture",
    };

    useEffect(() => {
        if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
            console.error("PayPal Client ID is missing in .env");
        }
    }, []);

    return (
        <PayPalScriptProvider options={initialOptions}>
            <div className="mx-4 lg:mx-[10%] py-6 sm:py-8 md:py-12">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
                    {/* Shipping Form */}
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-teal-600" />
                            Shipping Details
                        </h2>

                        {savedAddresses.length > 0 && (
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Saved Addresses</h2>
                                <div className="space-y-3">
                                    {savedAddresses.map((addr) => (
                                        <label
                                            key={addr._id}
                                            className="flex items-start gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-teal-300 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50 min-h-[60px]"
                                        >
                                            <input
                                                type="radio"
                                                name="savedAddress"
                                                value={addr._id}
                                                checked={selectedAddressId === addr._id}
                                                onChange={() => handleAddressSelect(addr)}
                                                className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 text-sm sm:text-base">{addr.fullName}</div>
                                                <div className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 mt-1">Phone: {addr.phone}</div>
                                            </div>
                                        </label>
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

                        <form className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="lg:sticky lg:top-24">
                        <div className="bg-gray-50 p-6 rounded-xl h-fit">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item._id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                            <img src={item.product?.mainImage} alt="" className="w-full h-full object-contain" loading="lazy" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">{item.product?.title}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            <p className="text-sm sm:text-base font-bold text-teal-600 mt-1">₹{(item.variant?.price || item.product?.basePrice) * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-200 space-y-2 mb-6">
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

                            <div className="relative z-0">
                                <PayPalButtons
                                    style={{ layout: "vertical" }}
                                    createOrder={async () => {
                                        try {
                                            // Validate form before creating order
                                            if (!formData.fullName || !formData.phone || !formData.addressLine || !formData.city || !formData.state || !formData.zipCode) {
                                                alert("Please fill in all shipping details first.");
                                                return null;
                                            }

                                            console.log("Creating order with data:", formData);
                                            const result = await dispatch(createOrder(formData));

                                            if (createOrder.fulfilled.match(result)) {
                                                const orderData = result.payload;
                                                setDbOrderId(orderData.id);

                                                if (!orderData.paypalOrderId) {
                                                    throw new Error("No PayPal Order ID returned from server");
                                                }

                                                console.log("Successfully created order. PayPal ID:", orderData.paypalOrderId);
                                                return orderData.paypalOrderId;
                                            } else {
                                                const errorMsg = result.payload?.error || result.payload?.message || result.payload || "Failed to create order";
                                                throw new Error(errorMsg);
                                            }
                                        } catch (err) {
                                            console.error("Detailed Order Creation Error:", err);
                                            alert("Order Error: " + err.message);
                                            return null;
                                        }
                                    }}
                                    onCancel={() => {
                                        console.log("Payment cancelled by user");
                                    }}
                                    onError={(err) => {
                                        console.error("PayPal Error:", err);
                                        alert("PayPal Button Error: " + err.message);
                                    }}
                                    onApprove={async (data, actions) => {
                                        try {
                                            const verifyResult = await dispatch(verifyPayment({
                                                paypalOrderId: data.orderID,
                                                orderId: dbOrderId
                                            }));

                                            if (verifyPayment.fulfilled.match(verifyResult)) {
                                                navigate('/order-success');
                                            } else {
                                                alert('Payment verification failed');
                                            }
                                        } catch (err) {
                                            console.error("Payment Capture Error:", err);
                                            alert("Failed to capture payment");
                                        }
                                    }}
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <ShieldCheck className="w-4 h-4" />
                                Secure Payment via PayPal
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
};

export default Checkout;
