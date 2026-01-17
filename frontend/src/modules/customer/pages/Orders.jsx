import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { Package, Calendar, MapPin, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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

    // Status color helper
    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return 'text-blue-600 bg-blue-50';
            case 'Shipped': return 'text-purple-600 bg-purple-50';
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
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                                <div className="flex flex-wrap gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                                        <p className="text-sm font-medium text-gray-900">₹{order.totalAmount}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Ship To</p>
                                        <div className="relative group cursor-pointer text-sm font-medium text-indigo-600">
                                            {order.shippingAddress.fullName}
                                            {/* Tooltip for full address could go here */}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </div>
                                    <span className="text-sm text-gray-500 font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-6 py-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-6">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {item.product && item.product.images && item.product.images[0] ? (
                                                        <img
                                                            src={item.product.images[0]}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {item.product ? item.product.name : 'Product Unavailable'}
                                                    </h3>
                                                    {item.variant && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Variant: {item.variant.name}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span className="mx-2">•</span>
                                                        <span className="font-medium text-gray-900">₹{item.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <div className="ml-4 sm:ml-6 flex-shrink-0 self-center">
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 min-h-[44px]"
                                        >
                                            View Order Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
