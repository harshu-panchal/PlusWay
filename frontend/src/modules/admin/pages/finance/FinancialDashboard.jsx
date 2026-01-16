import React, { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Loader from '../../../../shared/components/ui/Loader';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const FinancialDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/finance/stats`, {
                headers,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            } else {
                setError('Failed to fetch financial stats');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader /></div>;
    if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

    const { summary, charts } = stats;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Financial Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-green-500">
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Total Revenue</p>
                    <h2 className="text-3xl font-bold text-gray-800 mt-1">₹{summary.totalRevenue.toLocaleString()}</h2>
                    <p className="text-xs text-gray-400 mt-2">Gross income from all sources</p>
                </Card>

                <Card className="p-6 border-l-4 border-l-red-500">
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Gateway Fees</p>
                    <h2 className="text-3xl font-bold text-gray-800 mt-1">- ₹{summary.totalFees.toLocaleString()}</h2>
                    <p className="text-xs text-gray-400 mt-2">Platform & processing charges</p>
                </Card>

                <Card className="p-6 border-l-4 border-l-primary">
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Net Profit</p>
                    <h2 className="text-3xl font-bold text-primary mt-1">₹{summary.netRevenue.toLocaleString()}</h2>
                    <p className="text-xs text-gray-400 mt-2">Income after deductible fees</p>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Trends (Last 30 Days)</h3>
                {charts.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 italic">
                        Not enough data to display trends yet.
                    </div>
                ) : (
                    <div className="h-64 flex items-end gap-2">
                        {charts.map((day, idx) => {
                            const maxRevenue = Math.max(...charts.map(d => d.revenue));
                            const height = (day.revenue / maxRevenue) * 100;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                                    <div
                                        style={{ height: `${height}%` }}
                                        className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-sm"
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ₹{day.revenue}
                                        </div>
                                    </div>
                                    <p className="text-[8px] text-gray-400 mt-2 rotate-45 origin-left">{day._id.slice(5)}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                <div>
                    <h4 className="font-bold text-primary">Transaction History</h4>
                    <p className="text-sm text-gray-600">View detailed breakdown of every payment.</p>
                </div>
                <Button variant="primary" onClick={() => (window.location.href = '/admin/finance/transactions')}>
                    View All Transactions
                </Button>
            </div>
        </div>
    );
};

export default FinancialDashboard;
