import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Check, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DealForm = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        originalPrice: '',
        dealPrice: '',
        discount: '',
        images: ['', '', ''],
        endDate: '',
        isActive: true
    });

    // Search Products
    useEffect(() => {
        const fetchProducts = async () => {
            if (!searchQuery) return;
            try {
                const res = await fetch(`${API_BASE_URL}/products?search=${searchQuery}&limit=5`);
                const data = await res.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error(err);
            }
        };
        const timeout = setTimeout(fetchProducts, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Handle Product Selection
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        const price = product.price || 0;
        setFormData({
            ...formData,
            title: product.title || '',
            originalPrice: price,
            dealPrice: Math.round(price * 0.8), // Default 20% off
            discount: 20,
            images: [
                product.image || '',
                product.images?.[0] || '',
                product.images?.[1] || ''
            ]
        });
        setSearchQuery('');
        setProducts([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/deals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product: selectedProduct._id,
                    ...formData,
                    images: formData.images.filter(img => img) // Remove empty
                })
            });

            if (res.ok) {
                navigate('/admin/deals');
            } else {
                alert('Failed to create deal');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (index, file) => {
        if (!file) return;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (res.ok) {
                const data = await res.json();
                handleImageChange(index, data.url);
            } else {
                alert('Image upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Deal</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search product by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                            {products.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                    {products.map(p => (
                                        <div
                                            key={p._id}
                                            onClick={() => handleSelectProduct(p)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                                        >
                                            <img src={p.image} className="w-10 h-10 object-cover rounded" />
                                            <div>
                                                <div className="text-sm font-medium">{p.title}</div>
                                                <div className="text-xs text-gray-500">₹{p.price}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {selectedProduct && (
                            <div className="mt-3 flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 rounded-lg text-teal-800">
                                <Check size={16} />
                                <span className="text-sm font-medium">Selected: {selectedProduct.title}</span>
                                <button type="button" onClick={() => setSelectedProduct(null)} className="ml-auto hover:bg-teal-100 p-1 rounded">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                            <input
                                type="number"
                                name="originalPrice"
                                value={formData.originalPrice || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Price</label>
                            <input
                                type="number"
                                name="dealPrice"
                                value={formData.dealPrice || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={formData.endDate || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deal Images (3 recommended)</label>
                        <div className="grid grid-cols-3 gap-4">
                            {formData.images.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden group">
                                    {url ? (
                                        <>
                                            <img src={url} alt={`Slot ${i + 1}`} className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button type="button" onClick={() => handleImageChange(i, '')} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 custom-transition">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-teal-600">
                                            {uploading ? (
                                                <div className="animate-spin w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full" />
                                            ) : (
                                                <>
                                                    <Plus size={24} />
                                                    <span className="text-xs mt-1">Upload</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleFileUpload(i, e.target.files[0])}
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="submit"
                            disabled={!selectedProduct || uploading}
                            className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Create Deal'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/deals')}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DealForm;
