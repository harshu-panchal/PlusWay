import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import { Save, X, Plus, Upload, ImageIcon, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CategoryForm = ({ category, categories, onSave, onCancel, defaultParent = '' }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent: '',
        level: 0,
        filterableAttributes: [],
        icon: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newAttribute, setNewAttribute] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                parent: category.parent || '',
                level: category.level,
                filterableAttributes: category.filterableAttributes || [],
                icon: category.icon || ''
            });
        } else if (defaultParent) {
            // Pre-select parent if creating a subcategory
            setFormData(prev => ({ ...prev, parent: defaultParent }));
        }
    }, [category, defaultParent]);

    // Handle icon upload
    const handleIconUpload = async (e) => {
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
                setFormData(prev => ({ ...prev, icon: data.url }));
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

    // Remove icon
    const handleRemoveIcon = () => {
        setFormData(prev => ({ ...prev, icon: '' }));
    };

    // Check if this is a header category (no parent)
    const isHeaderCategory = !formData.parent;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addAttribute = () => {
        if (!newAttribute.trim()) return;
        if (formData.filterableAttributes.includes(newAttribute.trim())) return;

        setFormData(prev => ({
            ...prev,
            filterableAttributes: [...prev.filterableAttributes, newAttribute.trim()]
        }));
        setNewAttribute('');
    };

    const removeAttribute = (index) => {
        setFormData(prev => ({
            ...prev,
            filterableAttributes: prev.filterableAttributes.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Calculate level based on parent
        let level = 0;
        if (formData.parent) {
            const parentCat = categories.find(c => c._id === formData.parent);
            if (parentCat) level = parentCat.level + 1;
        }

        // Convert empty string parent to null for backend validation
        const submissionData = {
            ...formData,
            parent: formData.parent || null,
            level
        };

        await onSave(submissionData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Parent Category (Optional)</label>
                <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                    <option value="">None (Root Category)</option>
                    {categories
                        .filter(c => c._id !== category?._id) // Prevent self-parenting
                        .map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {'- '.repeat(cat.level)} {cat.name}
                            </option>
                        ))}
                </select>
            </div>

            {/* Icon Upload - Only for Header Categories */}
            {isHeaderCategory && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Category Icon (Optional)</label>
                    <p className="text-xs text-gray-400">Upload an icon to display on the homepage category grid. Recommended size: 80x80 pixels.</p>

                    <div className="flex items-start gap-4">
                        {/* Icon Preview */}
                        {formData.icon ? (
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50">
                                    <img
                                        src={formData.icon}
                                        alt="Category icon"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveIcon}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove icon"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleIconUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                                <div className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'}`}>
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            {formData.icon ? 'Change Icon' : 'Upload Icon'}
                                        </>
                                    )}
                                </div>
                            </label>
                            {formData.icon && (
                                <button
                                    type="button"
                                    onClick={handleRemoveIcon}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Filterable Attributes</label>
                <p className="text-xs text-gray-400 mb-2">Define attributes that can be used to filter products in this category (e.g. "Material", "Hardness").</p>

                <div className="flex gap-2 mb-2">
                    <Input
                        placeholder="Add new attribute..."
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addAttribute();
                            }
                        }}
                    />
                    <Button type="button" onClick={addAttribute} icon={Plus} variant="outline">Add</Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {formData.filterableAttributes.map((attr, index) => (
                        <div key={index} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-teal-100">
                            {attr}
                            <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="hover:text-teal-900"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {formData.filterableAttributes.length === 0 && (
                        <span className="text-sm text-gray-400 italic">No attributes defined.</span>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={loading} icon={Save}>
                    {category ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>

    );
};

export default CategoryForm;
