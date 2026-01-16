import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentOrder, updateOrderStatus } from '../../store/slices/adminOrderSlice';
import { ArrowLeft, Package, MapPin, CreditCard, User, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { orders, currentOrder, loading, success } = useSelector((state) => state.adminOrder);

    const [status, setStatus] = useState('');

    useEffect(() => {
        // Find order from state if available, else we might need to fetch individual order 
        // (but for now we rely on fetchAllOrders being called previously or we simulate it)
        // Ideally we should have a fetchOrderById thiunk, but let's reuse the list for now
        const order = orders.find(o => o._id === id);
        if (order) {
            dispatch(setCurrentOrder(id));
            setStatus(order.status);
        } else {
            // Fallback: This is a simplification. In real app, fetchById. 
            // Redirecting back for now if not found in current state (e.g. refresh)
            navigate('/admin/orders');
        }
    }, [id, orders, dispatch, navigate]);

    const handleStatusUpdate = async (newStatus) => {
        if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            await dispatch(updateOrderStatus({ id, status: newStatus }));
            setStatus(newStatus);
        }
    };

    if (!currentOrder) return <div className="p-8 text-center">Loading order details...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{currentOrder._id.slice(-6).toUpperCase()}</h1>
                    <p className="text-gray-500 text-sm">{new Date(currentOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <select
                        value={status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className={`border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 form-select
                            ${status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-white text-gray-900 border-gray-300'}`}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-semibold text-gray-900 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-indigo-500" />
                                Order Items
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {currentOrder.items.map((item, index) => (
                                <div key={index} className="p-6 flex items-start gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.product?.images?.[0] ? (
                                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Deleted Product'}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                        <p className="text-sm text-gray-500">Variant: {item.variant ? `${item.variant.color || ''} ${item.variant.size || ''}` : 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">₹{item.price}</p>
                                        <p className="text-sm text-gray-500">Total: ₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-6 border-t border-gray-100">
                            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                                <span>Total Amount</span>
                                <span>₹{currentOrder.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Shipping Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-500" />
                            Customer Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                                <p className="font-medium text-gray-900">{currentOrder.user?.name || 'Guest'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                <p className="text-gray-600">{currentOrder.user?.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                            Shipping Address
                        </h2>
                        {currentOrder.shippingAddress ? (
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-medium text-gray-900">{currentOrder.shippingAddress.addressLine}</p>
                                <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}</p>
                                <p>{currentOrder.shippingAddress.zipCode}</p>
                                <p>{currentOrder.shippingAddress.country}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No shipping address provided</p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-indigo-500" />
                            Payment Details
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="font-medium">Razorpay</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {currentOrder.paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Transaction ID</span>
                                <span className="font-mono text-xs">{currentOrder.paymentDetails?.razorpay_payment_id || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
