import { useState, useEffect } from 'react';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import { Save, Upload, X, Trash2, ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BrandForm = ({ brand, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        isActive: true,
        order: 0
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name,
                logo: brand.logo || '',
                isActive: brand.isActive,
                order: brand.order || 0
            });
        }
    }, [brand]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            setUploading(true);
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: uploadFormData
            });
            const data = await response.json();
            if (response.ok) {
                setFormData(prev => ({ ...prev, logo: data.url }));
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

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logo: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Brand Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />

            {/* Logo Upload */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Brand Logo</label>
                <div className="flex items-start gap-4">
                    {formData.logo ? (
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-lg border border-gray-200 p-2 bg-white flex items-center justify-center">
                                <img
                                    src={formData.logo}
                                    alt="Brand logo"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <div className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                {uploading ? 'Uploading...' : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        {formData.logo ? 'Change Logo' : 'Upload Logo'}
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Display Order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleChange}
                />
                <div className="flex items-center h-full pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={loading} icon={Save}>
                    {brand ? 'Update Brand' : 'Create Brand'}
                </Button>
            </div>
        </form>
    );
};

export default BrandForm;
