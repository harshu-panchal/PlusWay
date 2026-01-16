import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Loader from '../../../../shared/components/ui/Loader';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomerDetail();
    }, [id]);

    const fetchCustomerDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/customers/${id}`, {
                headers,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCustomer(data.data);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to fetch customer details');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader />
        </div>
    );

    if (error) return (
        <div className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => navigate('/admin/customers')}>Back to Customers</Button>
        </div>
    );

    if (!customer) return null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/customers')}
                        className="p-2"
                    >
                        ←
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-800">Customer Profile</h1>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {customer.isActive ? 'Active' : 'Blocked'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="p-6 col-span-1 border-t-4 border-t-primary">
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-3xl font-bold">
                            {customer.name?.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">{customer.name}</h2>
                        <p className="text-gray-500">{customer.email}</p>
                    </div>

                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Customer ID</span>
                            <span className="font-medium text-gray-800">#{customer._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Joined</span>
                            <span className="font-medium text-gray-800">{new Date(customer.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Orders</span>
                            <span className="font-medium text-gray-800">{customer.orders?.length || 0}</span>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    {/* Orders History */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📦 Recent Orders
                        </h3>
                        <div className="space-y-4">
                            {!customer.orders || customer.orders.length === 0 ? (
                                <p className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
                                    No orders found for this customer.
                                </p>
                            ) : (
                                <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                                    {customer.orders.map((order) => (
                                        <div key={order._id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <span className="text-sm font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                                                    <span className="mx-2 text-gray-300">|</span>
                                                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-600">
                                                    {order.items?.length || 0} items
                                                </div>
                                                <div className="font-bold text-primary">₹{order.totalAmount}</div>
                                            </div>
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="text-xs text-primary hover:underline mt-2 block"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Addresses */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📍 Saved Addresses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!customer.addresses || customer.addresses.length === 0 ? (
                                <p className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl col-span-full">
                                    No saved addresses found.
                                </p>
                            ) : (
                                customer.addresses.map((addr) => (
                                    <div key={addr._id} className="border border-gray-200 rounded-xl p-4 relative">
                                        {addr.isDefault && (
                                            <span className="absolute top-2 right-2 bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                                Default
                                            </span>
                                        )}
                                        <p className="text-sm text-gray-800 font-medium mb-1">{addr.street}</p>
                                        <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{addr.country}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
