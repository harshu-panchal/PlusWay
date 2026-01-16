import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllOrders } from '../../store/slices/adminOrderSlice';
import { Search, Filter, Eye, MoreVertical, Package, RefreshCw, Download, Calendar } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';

const OrderList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loading, pagination } = useSelector((state) => state.adminOrder);

    const [filters, setFilters] = useState({
        status: 'All',
        search: '',
        startDate: '',
        endDate: '',
        page: 1
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchAllOrders(filters));
        }, 500);

        return () => clearTimeout(timer);
    }, [dispatch, filters]);

    const handleViewOrder = (orderId) => {
        navigate(`/admin/orders/${orderId}`);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Processing': return 'info';
            case 'Shipped': return 'primary';
            case 'Cancelled': return 'danger';
            case 'Pending': return 'warning';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
                    <p className="text-slate-500 text-sm">Monitor and manage customer orders and fulfillment.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" icon={RefreshCw} size="sm" onClick={() => dispatch(fetchAllOrders(filters))}>
                        Refresh
                    </Button>
                    <Button variant="primary" icon={Download} size="sm">
                        Export
                    </Button>
                </div>
            </div>

            <Card padding={false} className="overflow-hidden border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, customer name/email..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                            <Filter className="w-4 h-4 text-slate-400 mr-2" />
                            <select
                                className="bg-transparent border-none text-sm font-bold text-slate-600 outline-none focus:ring-0 cursor-pointer"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Date:</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="date"
                                    className="text-xs border-none bg-transparent outline-none text-slate-600 font-medium p-0"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="date"
                                    className="text-xs border-none bg-transparent outline-none text-slate-600 font-medium p-0"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    min={filters.startDate}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Detail</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="py-8 px-6">
                                            <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">#{order._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[10px] text-slate-500 font-bold flex items-center mt-0.5">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                                                    {order.user?.name?.charAt(0) || order.shippingAddress?.fullName?.charAt(0) || 'G'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800">
                                                        {order.user?.name || order.shippingAddress?.fullName || 'Guest User'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium">
                                                        {order.user?.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-black text-slate-800">₹{order.totalAmount.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant={getStatusVariant(order.status)} size="sm">
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="relative flex justify-end items-center min-h-[32px]">
                                                {/* Default Actions */}
                                                <div className="group-hover:opacity-0 transition-opacity duration-200 flex items-center">
                                                    <MoreVertical className="w-5 h-5 text-slate-300" />
                                                </div>

                                                {/* Hover Actions */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-end gap-1 pointer-events-none group-hover:pointer-events-auto">
                                                    <button
                                                        onClick={() => handleViewOrder(order._id)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Package className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium italic">
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} orders)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 text-xs font-bold text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-3 py-1 text-xs font-bold text-primary-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-primary-50 rounded-lg transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default OrderList;

