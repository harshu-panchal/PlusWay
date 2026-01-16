import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/ui/Modal';
import Loader from '../../../../shared/components/ui/Loader';

const CustomerOrdersModal = ({ customer, isOpen, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (customer && isOpen) {
            fetchCustomerOrders();
        }
    }, [customer, isOpen]);

    const fetchCustomerOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/orders/admin/customer/${customer._id}`, {
                headers,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to fetch orders');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing': return 'bg-blue-100 text-blue-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Order History - ${customer?.name}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No orders found for this customer.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 truncate flex-1 mr-4">
                                                {item.product?.name || 'Unknown Product'} {item.variant?.name && `(${item.variant.name})`} x {item.quantity}
                                            </span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Total Amount</span>
                                    <span className="text-lg font-bold text-primary">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CustomerOrdersModal;
