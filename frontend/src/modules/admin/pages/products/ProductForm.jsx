import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import { Plus, Trash, Save, ArrowLeft, Layers, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // State for Cascading Categories
    const [selectedRoot, setSelectedRoot] = useState('');
    const [selectedSub, setSelectedSub] = useState('');
    const [selectedSubSub, setSelectedSubSub] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        sku: '',
        basePrice: '',
        category: '',
        mainImage: '',
        hasVariants: false,
        variants: [],
        specs: [],
        images: [],
        attributes: {} // Dynamic Key-Value pairs
    });

    const [availableAttributes, setAvailableAttributes] = useState([]);

    // Fetch Categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Mock fetch or verify actual service usage
                // assuming existing logic was fetching from API
                const response = await fetch(`${API_URL}/categories`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Helper to traverse up and collect attributes
    const getAttributesForCategory = (catId) => {
        const attrs = new Set();
        let current = categories.find(c => c._id === catId);

        // Simple traversal if we had parent references in memory, 
        // but here categories is a flat list with parent IDs.
        while (current) {
            if (current.filterableAttributes) {
                current.filterableAttributes.forEach(a => attrs.add(a));
            }
            if (current.parent) {
                current = categories.find(c => c._id === current.parent);
            } else {
                current = null;
            }
        }
        return Array.from(attrs);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryChange = (catId) => {
        setFormData(prev => ({ ...prev, category: catId }));
        if (catId) {
            const attrs = getAttributesForCategory(catId);
            setAvailableAttributes(attrs);
        } else {
            setAvailableAttributes([]);
        }
    };

    const handleAttributeChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [key]: value
            }
        }));
    };

    // --- Image Management ---
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (file) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                return data.url;
            } else {
                alert('Upload failed: ' + data.message);
                return null;
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleMainImageSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await handleFileUpload(file);
            if (url) {
                setFormData(prev => ({ ...prev, mainImage: url }));
            }
        }
    };

    const handleGalleryImageSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await handleFileUpload(file);
            if (url) {
                setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
            }
        }
    };

    const removeImageField = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    // --- Variant Management ---
    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { name: '', sku: '', price: '', stock: '' }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    // --- Specs Management ---
    const addSpec = () => {
        setFormData(prev => ({
            ...prev,
            specs: [...prev.specs, { label: '', value: '' }]
        }));
    };

    const removeSpec = (index) => {
        setFormData(prev => ({
            ...prev,
            specs: prev.specs.filter((_, i) => i !== index)
        }));
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...formData.specs];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specs: newSpecs }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = isEditMode
                ? `${API_URL}/products/${id}`
                : `${API_URL}/products`;

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/admin/products');
            } else {
                alert('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/products')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>
                <Button onClick={handleSubmit} isLoading={loading} icon={Save}>
                    Save Product
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* General Info */}
                <Card title="General Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input
                                label="Product Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. SuperD Protective Glass"
                                required
                            />

                            {/* Category Selection - 3 Levels */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Categorization</h3>

                                {/* Level 1: Root Category */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Main Category</label>
                                    <select
                                        value={selectedRoot}
                                        onChange={(e) => {
                                            setSelectedRoot(e.target.value);
                                            setSelectedSub('');
                                            setSelectedSubSub('');
                                            handleCategoryChange(e.target.value);
                                        }}
                                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                    >
                                        <option value="">Select Main Category</option>
                                        {categories.filter(c => c.level === 0).map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Level 2: Sub Category */}
                                {selectedRoot && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Category</label>
                                        <select
                                            value={selectedSub}
                                            onChange={(e) => {
                                                setSelectedSub(e.target.value);
                                                setSelectedSubSub('');
                                                handleCategoryChange(e.target.value);
                                            }}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        >
                                            <option value="">Select Sub Category</option>
                                            {categories.filter(c => c.parent === selectedRoot).map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Level 3: Sub-Sub Category */}
                                {selectedSub && categories.some(c => c.parent === selectedSub) && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Specific Model/Type</label>
                                        <select
                                            value={selectedSubSub}
                                            onChange={(e) => {
                                                setSelectedSubSub(e.target.value);
                                                handleCategoryChange(e.target.value);
                                            }}
                                            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        >
                                            <option value="">Select Specific Model</option>
                                            {categories.filter(c => c.parent === selectedSub).map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Attributes Section */}
                        {availableAttributes.length > 0 && (
                            <div className="md:col-span-2 p-4 bg-teal-50 rounded-lg border border-teal-100 space-y-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-teal-800">Key Features (Filters)</h3>
                                    <span className="text-xs text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200">
                                        Used for filtering on the website
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {availableAttributes.map(attr => (
                                        <div key={attr}>
                                            <label className="text-xs font-medium text-teal-700 uppercase tracking-wider block mb-1">
                                                {attr}
                                            </label>
                                            <Input
                                                value={formData.attributes?.[attr] || ''}
                                                onChange={(e) => handleAttributeChange(attr, e.target.value)}
                                                placeholder={`Enter ${attr}...`}
                                                className="bg-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Image Management */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700">Product Images</h3>

                                {/* Main Image */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Main Image</label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            onChange={handleMainImageSelect}
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-violet-50 file:text-violet-700
                                                hover:file:bg-violet-100
                                            "
                                        />
                                        {uploading && <span className="text-xs text-blue-500">Uploading...</span>}
                                    </div>
                                    {formData.mainImage && (
                                        <div className="relative mt-2 w-32 h-32 group">
                                            <img src={formData.mainImage} alt="Main Preview" className="w-full h-full object-contain border rounded bg-white" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, mainImage: '' }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Gallery Images */}
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">Gallery Images</label>

                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group w-20 h-20">
                                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover rounded border" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageField(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            onChange={handleGalleryImageSelect}
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-teal-50 file:text-teal-700
                                                hover:file:bg-teal-100
                                            "
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Base SKU"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="APP-GLS-001"
                                />
                                <Input
                                    label="Base Price (₹)"
                                    name="basePrice"
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={handleChange}
                                    placeholder="299"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Product description..."
                            />
                        </div>
                    </div>
                </Card>

                {/* Variants Section */}
                <Card title="Variants & Stock">
                    <div className="mb-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="hasVariants"
                            id="hasVariants"
                            checked={formData.hasVariants}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="hasVariants" className="text-sm font-medium text-gray-700">
                            This product has multiple variants (e.g. different models/colors)
                        </label>
                    </div>

                    {formData.hasVariants && (
                        <div className="space-y-4">
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Variant Name (Model)</th>
                                            <th className="px-4 py-3">SKU</th>
                                            <th className="px-4 py-3">Price Override</th>
                                            <th className="px-4 py-3">Stock</th>
                                            <th className="px-4 py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formData.variants.map((variant, index) => (
                                            <tr key={index} className="bg-white hover:bg-gray-50">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={variant.name}
                                                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded"
                                                        placeholder="e.g. iPhone 13"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded"
                                                        placeholder="APP-GLS-13"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded"
                                                        placeholder="Optional"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        value={variant.stock}
                                                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addVariant} icon={Plus}>
                                Add Variant
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Specifications */}
                <Card title="Specifications">
                    <div className="space-y-4">
                        {formData.specs.map((spec, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Label (e.g. Material)"
                                        value={spec.label}
                                        onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        placeholder="Value (e.g. Tempered Glass)"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSpec(index)}
                                    className="text-red-500 hover:text-red-700 mt-2"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addSpec} icon={Plus}>
                            Add Specification
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ProductForm;
