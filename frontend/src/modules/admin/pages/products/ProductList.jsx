import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import { Plus, Edit, Trash, Package } from 'lucide-react';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <Button onClick={() => navigate('/admin/products/add')} icon={Plus}>
                    Add Product
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Product</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Category</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Price</th>
                                <th className="text-left py-4 px-4 font-semibold text-gray-600">Inventory</th>
                                <th className="text-right py-4 px-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No products found. Add one to get started.</td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.title}</p>
                                                    <p className="text-xs text-gray-500">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 font-medium text-gray-900">
                                            ₹{product.basePrice}
                                        </td>
                                        <td className="py-4 px-4">
                                            {product.hasVariants ? (
                                                <div>
                                                    <span className="text-sm text-gray-900">{product.variants.length} Variants</span>
                                                    <p className="text-xs text-gray-500">
                                                        Total: {product.variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)} units
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
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
        </div>
    );
};

export default ProductList;
