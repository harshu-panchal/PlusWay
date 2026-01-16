import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Save, AlertTriangle, ChevronDown, ChevronUp, Search, RefreshCw } from 'lucide-react';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const StockList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null); // Track which product/variant is updating
    const [expandedRows, setExpandedRows] = useState({}); // Track expanded variants

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch all products - assume pagination might be needed later but fine for now
            const response = await fetch(`${API_URL}/products?limit=1000`);
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (productId) => {
        setExpandedRows(prev => ({ ...prev, [productId]: !prev[productId] }));
    };

    const handleStockChange = (productId, newStock, variantId = null) => {
        setProducts(prev => prev.map(p => {
            if (p._id === productId) {
                if (variantId) {
                    return {
                        ...p,
                        variants: p.variants.map(v =>
                            v._id === variantId ? { ...v, stock: parseInt(newStock) || 0 } : v
                        )
                    };
                } else {
                    return { ...p, stock: parseInt(newStock) || 0 };
                }
            }
            return p;
        }));
    };

    const saveStock = async (productId, stock, variantId = null) => {
        const updateKey = variantId ? `${productId}-${variantId}` : productId;
        setUpdating(updateKey);

        try {
            const token = localStorage.getItem('token'); // Simplistic auth check
            // We should use axios with credentials or proper auth headers if needed
            // Assuming cookie auth is primary based on recent fixes, but simple fetch might fail if not using credentials: 'include'

            const response = await fetch(`${API_URL}/products/${productId}/stock`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // If using bearer
                },
                credentials: 'include', // Important for admin auth
                body: JSON.stringify({
                    stock,
                    variantId
                })
            });

            if (response.ok) {
                // Success feedback?
            } else {
                alert('Failed to update stock');
                // Revert? (Ideally yes, but let's keep it simple)
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Error updating stock');
        } finally {
            setUpdating(null);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => navigate('/admin')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search products..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={fetchProducts} icon={RefreshCw}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 w-10"></th>
                                <th className="px-4 py-3">Product Name</th>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3 w-48">Stock Level</th>
                                <th className="px-4 py-3 w-32">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading inventory...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <React.Fragment key={product._id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-center">
                                                {product.hasVariants && (
                                                    <button
                                                        onClick={() => toggleExpand(product._id)}
                                                        className="text-gray-400 hover:text-indigo-600"
                                                    >
                                                        {expandedRows[product._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                        {product.mainImage ? (
                                                            <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Img</div>
                                                        )}
                                                    </div>
                                                    <span>{product.title}</span>
                                                    {product.variants?.length > 0 && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                            {product.variants.length} Vars
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                                {product.sku || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {!product.hasVariants ? (
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={product.stock}
                                                            onChange={(e) => handleStockChange(product._id, e.target.value)}
                                                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={() => saveStock(product._id, product.stock)}
                                                            disabled={updating === product._id}
                                                            className={`p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors ${updating === product._id ? 'opacity-50' : ''}`}
                                                            title="Save Stock"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">See variants</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {!product.hasVariants && (
                                                    stockStatusBadge(product.stock)
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                    className="text-gray-400 hover:text-indigo-600 font-medium text-xs"
                                                >
                                                    Edit Product
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded Variants Row */}
                                        {product.hasVariants && expandedRows[product._id] && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan="6" className="px-4 py-0">
                                                    <div className="pl-14 py-3 pr-4 space-y-2 border-l-4 border-indigo-100 ml-4 my-2">
                                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex justify-between">
                                                            <span>Variants</span>
                                                            <span>Stock</span>
                                                        </div>
                                                        {product.variants.map((variant) => (
                                                            <div key={variant._id} className="flex items-center justify-between gap-4 py-1 border-b border-gray-100 last:border-0 border-dashed">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-800">{variant.name}</span>
                                                                    <span className="text-xs text-gray-500 font-mono">{variant.sku}</span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    {stockStatusBadge(variant.stock)}
                                                                    <div className="flex gap-2 items-center">
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            value={variant.stock}
                                                                            onChange={(e) => handleStockChange(product._id, e.target.value, variant._id)}
                                                                            className="w-20 px-2 py-1 text-sm border border-gray-300 bg-white rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                                        />
                                                                        <button
                                                                            onClick={() => saveStock(product._id, variant.stock, variant._id)}
                                                                            disabled={updating === `${product._id}-${variant._id}`}
                                                                            className={`p-1.5 rounded bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 transition-colors ${updating === `${product._id}-${variant._id}` ? 'opacity-50' : ''}`}
                                                                            title="Save Variant Stock"
                                                                        >
                                                                            <Save className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const stockStatusBadge = (stock) => {
    if (stock <= 0) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Out of Stock</span>;
    if (stock < 10) return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Low Stock</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">In Stock</span>;
};

export default StockList;
