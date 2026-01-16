import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import api from '../../../shared/utils/api';

const Analytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/analytics');
                if (response.data.success) {
                    setAnalyticsData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-cyan-600">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (!analyticsData) return <div className="text-gray-900 text-center mt-10">Failed to load data.</div>;

    const { metrics, salesOverTime, ordersByStatus, topProducts } = analyticsData;

    // Colors for Pie Chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                    Analytics Dashboard
                </h1>
                <p className="text-gray-600">Overview of your business performance</p>
            </header>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Revenue"
                    value={`₹${metrics.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={24} />}
                    color="text-emerald-600"
                    bgColor="bg-emerald-100"
                />
                <MetricCard
                    title="Total Orders"
                    value={metrics.totalOrders}
                    icon={<ShoppingBag size={24} />}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                />
                <MetricCard
                    title="Total Customers"
                    value={metrics.totalCustomers}
                    icon={<Users size={24} />}
                    color="text-purple-600"
                    bgColor="bg-purple-100"
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={`₹${metrics.totalOrders > 0 ? Math.round(metrics.totalRevenue / metrics.totalOrders) : 0}`}
                    icon={<TrendingUp size={24} />}
                    color="text-yellow-600"
                    bgColor="bg-yellow-100"
                />
            </div>

            {/* Charts Section 1: Revenue & Orders Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue Trend (Last 30 Days)</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesOverTime}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="_id" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' }}
                                    itemStyle={{ color: '#0891b2' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#0891b2" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Orders by Status */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Status Distribution</h2>
                    <div className="h-80 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ordersByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {ordersByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Top Products */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Selling Products</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#6b7280" />
                            <YAxis dataKey="name" type="category" width={150} stroke="#6b7280" tick={{ fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827' }}
                            />
                            <Bar dataKey="totalSold" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color, bgColor }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between"
    >
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
            {icon}
        </div>
    </motion.div>
);

export default Analytics;
