import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Modal from '../../../../shared/components/ui/Modal';
import Input from '../../../../shared/components/ui/Input';
import { Plus, Edit, Trash, Image as ImageIcon } from 'lucide-react';

const BannerList = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const fetchBanners = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/banners/admin');
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
            await fetch(`http://localhost:5000/api/banners/${id}`, { method: 'DELETE' });
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
        title: '', subtitle: '', image: '', position: 'hero', isActive: true, link: '/'
    });

    useEffect(() => {
        if (banner) setFormData(banner);
    }, [banner]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = banner ? `http://localhost:5000/api/banners/${banner._id}` : 'http://localhost:5000/api/banners';
        const method = banner ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" name="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            <Input label="Subtitle" name="subtitle" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Image URL</label>
                <div className="flex gap-2">
                    <input
                        type="url"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://..."
                        required
                    />
                </div>
                {formData.image && <img src={formData.image} alt="Preview" className="h-20 w-auto object-cover rounded mt-2 border" />}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Position</label>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.position}
                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                    >
                        <option value="hero">Hero Carousel</option>
                        <option value="side">Side Banner (Right of Hero)</option>
                        <option value="bottom-grid">Bottom Grid (Promo)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Link URL</label>
                    <input
                        type="text"
                        className="px-4 py-2 border border-gray-300 rounded-lg"
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
                    className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Banner</Button>
            </div>
        </form>
    );
};

export default BannerList;
