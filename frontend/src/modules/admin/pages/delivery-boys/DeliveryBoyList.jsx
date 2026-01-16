import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Truck, Edit, Trash, Lock, Unlock } from 'lucide-react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Loader from '../../../../shared/components/ui/Loader';
import Badge from '../../../../shared/components/ui/Badge';
import DeliveryBoyModal from '../../components/delivery/DeliveryBoyModal';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create separate axios instance for admin/delivery that ensures credentials
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

const DeliveryBoyList = () => {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBoy, setSelectedBoy] = useState(null);

    const fetchDeliveryBoys = async () => {
        setLoading(true);
        try {
            console.log('Fetching delivery boys...');
            const response = await api.get('/delivery/admin/all');

            console.log('Response data:', response.data);
            if (response.data.success) {
                setDeliveryBoys(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch delivery boys', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveryBoys();
    }, []);

    const handleCreate = () => {
        setSelectedBoy(null);
        setIsModalOpen(true);
    };

    const handleEdit = (boy) => {
        setSelectedBoy(boy);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this delivery boy?')) return;

        try {
            const response = await api.delete(`/delivery/admin/${id}`);

            if (response.data.success) {
                fetchDeliveryBoys();
            }
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const toggleStatus = async (boy) => {
        try {
            const response = await api.put(`/delivery/admin/${boy._id}`, { isActive: !boy.isActive });

            if (response.data.success) {
                fetchDeliveryBoys();
            }
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const filteredBoys = deliveryBoys.filter(boy =>
        boy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Delivery Team</h1>
                    <p className="text-slate-500 text-sm">Manage your delivery personnel and fleet.</p>
                </div>
                <Button onClick={handleCreate} icon={Plus} size="sm">
                    Add Delivery Boy
                </Button>
            </div>

            <Card padding={false} className="overflow-hidden border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Name & Contact</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Stats</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 flex justify-center">
                                        <Loader />
                                    </td>
                                </tr>
                            ) : filteredBoys.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Truck className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">No delivery boys found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBoys.map((boy) => (
                                    <tr key={boy._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                    {boy.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{boy.name}</p>
                                                    <p className="text-xs text-slate-500">{boy.email}</p>
                                                    <p className="text-xs text-slate-500">{boy.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="capitalize font-medium text-slate-700">{boy.vehicleType}</span>
                                                <span className="text-xs text-slate-400">{boy.vehicleNumber || 'No Plate #'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant={boy.isActive ? 'success' : 'danger'} size="sm">
                                                {boy.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            {/* Placeholder for future stats */}
                                            <span className="text-xs text-slate-400">-</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => toggleStatus(boy)}
                                                    className={`p-1.5 rounded-lg transition-all ${boy.isActive ? 'text-orange-400 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                                                    title={boy.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {boy.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(boy)}
                                                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(boy._id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <DeliveryBoyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                deliveryBoy={selectedBoy}
                onSuccess={fetchDeliveryBoys}
            />
        </div>
    );
};

export default DeliveryBoyList;
