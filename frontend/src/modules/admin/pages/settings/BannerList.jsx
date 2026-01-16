import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Modal from '../../../../shared/components/ui/Modal';
import Input from '../../../../shared/components/ui/Input';
import { Plus, Edit, Trash, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_URL}/banners/admin`);
            if (response.ok) {
                setBanners(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await fetch(`${API_URL}/banners/${id}`, { method: 'DELETE' });
            fetchBanners();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Banners</h1>
                <Button onClick={() => { setEditingBanner(null); setIsFormOpen(true); }} icon={Plus}>
                    Add Banner
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Preview</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Title & Position</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Status</th>
                                <th className="text-right py-4 px-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((banner) => (
                                <tr key={banner._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                                            <img src={banner.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-gray-900">{banner.title}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                            {banner.position}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button onClick={() => { setEditingBanner(banner); setIsFormOpen(true); }} className="text-blue-600 mr-3">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)} className="text-red-600">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingBanner ? "Edit Banner" : "New Banner"}
            >
                <BannerForm
                    banner={editingBanner}
                    onSave={() => { setIsFormOpen(false); fetchBanners(); }}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

const BannerForm = ({ banner, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        position: 'hero',
        isActive: true,
        link: '/',
        bgColor: 'from-gray-800 to-gray-900',
        order: 0
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (banner) setFormData({
            ...banner,
            bgColor: banner.bgColor || 'from-gray-800 to-gray-900',
            order: banner.order || 0
        });
    }, [banner]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            setUploading(true);
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: uploadData
            });
            const data = await response.json();

            if (response.ok) {
                setFormData(prev => ({ ...prev, image: data.url }));
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = banner ? `${API_URL}/banners/${banner._id}` : `${API_URL}/banners`;
        const method = banner ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSave();
            } else {
                const data = await response.json();
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Network error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
            />

            <Input
                label="Subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
            />

            {/* Image Upload */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Banner Image</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-teal-50 file:text-teal-700
                            hover:file:bg-teal-100
                        "
                    />
                    {uploading && <span className="text-xs text-teal-600 font-medium animate-pulse">Uploading...</span>}
                </div>
                {formData.image && (
                    <div className="relative mt-2 w-full h-32 rounded-lg overflow-hidden border border-gray-200 group">
                        <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <input
                    type="hidden"
                    required
                    value={formData.image}
                /> {/* Hidden required input to force validation */}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                        value={formData.position}
                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                    >
                        <option value="hero">Hero Carousel</option>
                        <option value="side">Side Banner (Right of Hero)</option>
                        <option value="bottom-grid">Bottom Grid (Promo)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Sort Order</label>
                    <input
                        type="number"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.order}
                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>

            {/* Background Gradient & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Background Gradient (Tailwind)</label>
                    <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.bgColor}
                        onChange={e => setFormData({ ...formData, bgColor: e.target.value })}
                        placeholder="e.g. from-purple-800 to-indigo-900"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Link URL</label>
                    <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.link}
                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Active</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={uploading}>
                    {banner ? 'Update Banner' : 'Create Banner'}
                </Button>
            </div>
        </form>
    );
};

export default BannerList;
