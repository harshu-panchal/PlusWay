import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { Package, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(fetchMyOrders());
    }, [dispatch]);

    // Format date helper
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getPaymentLabel = (order) => {
        if (order.paymentMethod === 'COD') return 'Cash on Delivery';
        return order.paymentMethod || (order.paymentDetails?.razorpay_order_id ? 'Razorpay' : 'PayPal');
    };

    // Status color helper
    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return 'text-blue-600 bg-blue-50';
            case 'Shipped': return 'text-purple-600 bg-purple-50';
            case 'Out for Delivery': return 'text-amber-600 bg-amber-50';
            case 'Delivered': return 'text-green-600 bg-green-50';
            case 'Cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="mx-4 lg:mx-[10%] py-16 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-4 lg:mx-[10%] py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Failed to load orders: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-4 lg:mx-[10%] py-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                    <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Order <span className="font-mono text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                                    <div>
                                        <dt className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide">Order Placed</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-0.5">{formatDate(order.createdAt)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide">Total</dt>
                                        <dd className="text-sm font-bold text-gray-900 mt-0.5">₹{order.totalAmount}</dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide">Ship To</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-0.5 truncate">{order.shippingAddress?.fullName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-[11px] text-gray-500 uppercase font-semibold tracking-wide">Payment</dt>
                                        <dd className="text-sm font-medium text-gray-900 mt-0.5">{getPaymentLabel(order)}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Order Items */}
                            <div className="px-4 sm:px-6 divide-y divide-gray-100">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 py-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            {item.product && (item.product.mainImage || item.product.images?.[0]) ? (
                                                <img
                                                    src={item.product.mainImage || item.product.images[0]}
                                                    alt={item.product.title}
                                                    className="w-full h-full object-contain"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                                                    {item.product ? item.product.title : 'Product Unavailable'}
                                                </h3>
                                                {item.variant?.name && (
                                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Variant: {item.variant.name}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2 text-sm">
                                                <span className="text-gray-500">Qty: {item.quantity}</span>
                                                <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex justify-end">
                                <Link
                                    to={`/orders/${order._id}`}
                                    className="flex items-center justify-center gap-1 w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 min-h-[44px] transition-colors"
                                >
                                    View Order Details
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
