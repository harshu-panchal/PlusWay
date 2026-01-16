import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Badge from '../../../../shared/components/ui/Badge';
import { Plus, Edit, Trash, Package, Search, Filter, MoreVertical, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState([]);

    const [filters, setFilters] = useState({
        search: '',
        categorySlug: '',
        minPrice: '',
        maxPrice: '',
        stockStatus: '',
        sort: 'newest',
        page: 1
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    // Fetch Categories for filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/categories`);
                const data = await response.json();
                // Flatten or just take roots? Assuming list of categories.
                // If nested, we might need to handle that, but let's assume flat or root list for now.
                setCategories(data.data || []);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
                setPagination({
                    page: data.page || 1,
                    pages: data.pages || 1,
                    total: data.total || 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    // Debounced Search Handler
    const handleSearch = (e) => {
        const value = e.target.value;
        // Update local state immediately for input, but debounce the filter update
        // Actually, let's just debounce the filter update or use a separate effect.
        // For simplicity:
        handleFilterChange('search', value);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Products</h1>
                    <p className="text-slate-500 text-sm">Manage your product catalog and inventory.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                        variant={showFilters ? 'primary' : 'outline'}
                        icon={Filter}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                    <Button onClick={() => navigate('/admin/products/add')} icon={Plus} size="sm">
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Category</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                                value={filters.categorySlug}
                                onChange={(e) => handleFilterChange('categorySlug', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Status */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Stock Status</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                                value={filters.stockStatus}
                                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="in_stock">In Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Price Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Sort By</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-slate-600"
                            onClick={() => setFilters({
                                search: '',
                                categorySlug: '',
                                minPrice: '',
                                maxPrice: '',
                                stockStatus: '',
                                sort: 'newest',
                                page: 1
                            })}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </Card>
            )}

            <Card padding={false} className="overflow-hidden border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title, SKU..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            value={filters.search} // Controlled input
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status & Stock</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="py-8 px-6">
                                            <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Package className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">No products found</p>
                                            <p className="text-sm">Try adjusting your filters or add a new product.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all overflow-hidden border border-slate-100">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{product.title}</p>
                                                    <p className="text-xs text-slate-500 font-medium">SKU: {product.sku || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="info" size="sm">
                                                {product.category?.name || 'Uncategorized'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">₹{product.basePrice}</span>
                                                {product.discountedPrice && (
                                                    <span className="text-[10px] text-slate-400 line-through">₹{product.discountedPrice}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                {product.hasVariants ? (
                                                    <>
                                                        <Badge variant="indigo" size="sm" className="w-fit">
                                                            {product.variants.length} Variants
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-500 font-bold ml-1">
                                                            Total: {product.variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Badge
                                                            variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}
                                                            size="sm"
                                                            className="w-fit"
                                                        >
                                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                        </Badge>
                                                        <span className="text-[10px] text-slate-500 font-bold ml-1">
                                                            {product.stock} units
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="relative flex justify-end items-center min-h-[32px]">
                                                {/* Default Actions */}
                                                <div className="group-hover:opacity-0 transition-opacity duration-200">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </div>

                                                {/* Hover Actions */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-end gap-1 pointer-events-none group-hover:pointer-events-auto">
                                                    <button
                                                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <p className="text-xs text-slate-500 font-medium italic">
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} products)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 text-xs font-bold text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-3 py-1 text-xs font-bold text-primary-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-primary-50 rounded-lg transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProductList;

