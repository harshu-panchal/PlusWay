import React, { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Loader from '../../../../shared/components/ui/Loader';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token && token !== 'null') {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/finance/transactions?page=${currentPage}`, {
                headers,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data.data);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Date,Transaction ID,Order ID,Amount,Fee,Type,Status'];
        const rows = transactions.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            t.transactionId,
            t.orderId?._id || 'N/A',
            t.amount,
            t.breakdown?.platformFee || 0,
            t.type,
            t.status
        ].join(','));

        const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${Date.now()}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/finance')}>←</Button>
                    <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
                </div>
                <Button variant="outline" onClick={exportToCSV} className="text-primary border-primary">
                    Export to CSV
                </Button>
            </div>

            <Card>
                {loading ? (
                    <div className="flex justify-center py-12"><Loader /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Net (After Fees)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(t.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {t.transactionId}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            ₹{t.amount}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-green-600 font-bold">
                                            ₹{(t.amount - (t.breakdown?.platformFee || 0)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-green-100 text-green-700">
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <Link to={`/admin/orders/${t.orderId?._id}`} className="text-primary hover:underline">
                                                View Order
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                    <span className="flex items-center px-4">Page {currentPage} of {totalPages}</span>
                    <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
