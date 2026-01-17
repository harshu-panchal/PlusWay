import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Eye, EyeOff, Timer } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DealList = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDeals = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/deals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDeals(data);
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/deals/${id}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchDeals(); // Refresh
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const deleteDeal = async (id) => {
        if (!window.confirm('Are you sure you want to delete this deal?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/deals/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDeals();
        } catch (error) {
            console.error('Error deleting deal:', error);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Deal of the Day</h1>
                    <p className="text-gray-500">Manage daily special offers</p>
                </div>
                <Link to="/admin/deals/new" className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors">
                    <Plus size={20} /> New Deal
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-gray-600">Product</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-600">Price</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-600">Countdown Ends</th>
                            <th className="text-center p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : deals.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No deals found. Create one to get started.</td></tr>
                        ) : (
                            deals.map((deal) => (
                                <tr key={deal._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={deal.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 line-clamp-1">{deal.title}</div>
                                                <div className="text-xs text-gray-500">Save {deal.discount}%</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium">₹{deal.dealPrice.toLocaleString()}</div>
                                        <div className="text-xs text-slate-400 line-through">₹{deal.originalPrice.toLocaleString()}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Timer size={14} />
                                            {/* {format(new Date(deal.endDate), 'MMM d, yyyy HH:mm')} */}
                                            {new Date(deal.endDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(deal._id)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${deal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                        >
                                            {deal.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => toggleStatus(deal._id)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Toggle Status">
                                                {deal.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            {/* Edit not implemented yet, just delete and recreate for MVP */}
                                            {/* <Link to={`/admin/deals/${deal._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </Link> */}
                                            <button onClick={() => deleteDeal(deal._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DealList;
