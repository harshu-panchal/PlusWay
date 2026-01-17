import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, reset } from '../../../store/authSlice';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { User, Mail, LogOut, Package, MapPin, ChevronRight } from 'lucide-react';
import AddressList from '../components/AddressList';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const { orders, loading } = useSelector((state) => state.order);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchMyOrders());
    }, [dispatch]);

    const onLogout = async () => {
        await dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    if (!user) {
        return null;
    }

    // Get top 2 recent orders
    const recentOrders = orders ? orders.slice(0, 2) : [];

    return (
        <div className="mx-4 lg:mx-[10%] py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* User Info Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                                <span className="text-2xl sm:text-3xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-500 mb-6">{user.role}</p>

                            <div className="w-full space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </div>

                            <div className="mt-8 w-full">
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Orders Section Preview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-indigo-500" />
                                Recent Orders
                            </h3>
                            <button
                                onClick={() => navigate('/orders')}
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                View All
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        ) : recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {recentOrders.map(order => (
                                    <div key={order._id} onClick={() => navigate(`/orders`)} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors gap-2 sm:gap-0">
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm sm:text-base">Order #{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>No recent orders found.</p>
                            </div>
                        )}
                    </div>

                    {/* Addresses Section Preview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <AddressList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
