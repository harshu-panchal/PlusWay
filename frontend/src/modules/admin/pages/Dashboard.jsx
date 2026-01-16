import { useState, useEffect } from 'react';
import Card from '../../../shared/components/ui/Card';
import { Package, FolderTree, Users, Banknote, TrendingUp, Clock } from 'lucide-react';
import api from '../../../shared/utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Products', value: '0', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+0%' },
        { label: 'Total Categories', value: '0', icon: FolderTree, color: 'text-teal-600', bg: 'bg-teal-50', trend: '+0%' },
        { label: 'Total Customers', value: '0', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+0%' },
        { label: 'Revenue', value: '₹0', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+0%' },
    ]);
    const [activities, setActivities] = useState([]);
    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch dashboard counts and recent activity
                const dashboardResponse = await api.get('/analytics/dashboard');
                // Fetch sales data for the chart (re-using analytics endpoint logic if needed, or I can add it to dashboard response. 
                // For now, let's fetch analytics main data for the chart as key data is there)
                const analyticsResponse = await api.get('/analytics');

                if (dashboardResponse.data.success) {
                    const data = dashboardResponse.data;
                    const iconMap = {
                        'Total Products': Package,
                        'Total Categories': FolderTree,
                        'Total Customers': Users,
                        'Revenue': Banknote
                    };
                    const colorMap = {
                        'Total Products': { color: 'text-blue-600', bg: 'bg-blue-50' },
                        'Total Categories': { color: 'text-teal-600', bg: 'bg-teal-50' },
                        'Total Customers': { color: 'text-purple-600', bg: 'bg-purple-50' },
                        'Revenue': { color: 'text-emerald-600', bg: 'bg-emerald-50' }
                    };

                    const updatedStats = data.stats.map(s => ({
                        ...s,
                        icon: iconMap[s.label] || Package,
                        color: colorMap[s.label]?.color || 'text-gray-600',
                        bg: colorMap[s.label]?.bg || 'bg-gray-50',
                        trend: s.trend || '+0%'
                    }));
                    setStats(updatedStats);
                    setActivities(data.recentActivities || []);
                }

                if (analyticsResponse.data.success) {
                    setSalesData(analyticsResponse.data.data.salesOverTime || []);
                }

            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Welcome back, Admin!</h1>
                    <p className="text-slate-500 text-sm">Here's what's happening with your store today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">
                        Manage Store
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="group hover:border-primary-200 transition-all duration-300">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Sales Overview</h2>
                        <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-2 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSalesDashboard" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="_id" stroke="#9ca3af" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#2563eb' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesDashboard)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
                        <button className="text-primary-600 text-xs font-bold hover:underline">View All</button>
                    </div>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {activities.length > 0 ? (
                                activities.map((activity, idx) => (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                            {idx !== activities.length - 1 && (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" />
                                            )}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.status === 'success' ? 'bg-green-100 text-green-600' :
                                                            activity.status === 'info' ? 'bg-blue-100 text-blue-600' : 'bg-primary-100 text-primary-600'
                                                        }`}>
                                                        <Clock className="w-4 h-4" />
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="relative">
                                                        <p className="text-sm text-slate-800 font-semibold">{activity.message}</p>
                                                        <p className="mt-0.5 text-xs text-slate-500 font-medium">{new Date(activity.time).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                            )}
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

