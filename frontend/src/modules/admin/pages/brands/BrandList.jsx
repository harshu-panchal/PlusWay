import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Modal from '../../../../shared/components/ui/Modal';
import Badge from '../../../../shared/components/ui/Badge';
import BrandForm from './BrandForm';
import { Plus, Edit, Trash, Search, ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BrandList = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBrands = async () => {
        try {
            const response = await fetch(`${API_URL}/brands`);
            if (response.ok) {
                const data = await response.json();
                setBrands(data);
            }
        } catch (error) {
            console.error('Failed to fetch brands', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleAdd = () => {
        setEditingBrand(null);
        setIsFormOpen(true);
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this brand?')) return;
        try {
            const response = await fetch(`${API_URL}/brands/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchBrands();
            }
        } catch (error) {
            console.error('Failed to delete brand', error);
        }
    };

    const handleSave = async (formData) => {
        try {
            const url = editingBrand
                ? `${API_URL}/brands/${editingBrand._id}`
                : `${API_URL}/brands`;

            const method = editingBrand ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsFormOpen(false);
                fetchBrands();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to save brand');
            }
        } catch (error) {
            console.error('Failed to save brand', error);
            alert('An unexpected error occurred');
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Brands</h1>
                    <p className="text-slate-500 text-sm">Manage brands displayed on the homepage marquee.</p>
                </div>
                <Button onClick={handleAdd} icon={Plus} size="sm">
                    Add Brand
                </Button>
            </div>

            <Card padding={false} className="overflow-hidden border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Logo</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="py-6 px-6">
                                            <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBrands.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">No brands found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 p-1 flex items-center justify-center">
                                                {brand.logo ? (
                                                    <img
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-slate-900">
                                            {brand.name}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">
                                            {brand.order}
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant={brand.isActive ? 'success' : 'warning'} size="sm">
                                                {brand.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(brand)}
                                                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand._id)}
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

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingBrand ? "Edit Brand" : "Add New Brand"}
            >
                <BrandForm
                    brand={editingBrand}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default BrandList;
