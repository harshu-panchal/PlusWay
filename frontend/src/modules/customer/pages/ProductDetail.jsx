import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { ShoppingCart, Star, Truck, ShieldCheck, Heart } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Fetch by slug
                const data = await productService.getProductBySlug(slug);
                setProduct(data);
                // Auto-select first variant if exists
                if (data.hasVariants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                } else {
                    setSelectedVariant(null);
                }
                setActiveImage(0); // Reset image on product change

                // Fetch Related Products
                if (data.category?.slug) {
                    const relatedData = await productService.getAllProducts({
                        categorySlug: data.category.slug,
                        limit: 4 // Assuming API/Service supports limit, or returns all and we slice
                    });
                    // Filter out current product
                    const related = (relatedData.products || [])
                        .filter(p => p._id !== data._id)
                        .slice(0, 4);
                    setRelatedProducts(related);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProduct();
    }, [slug]);

    if (loading) return <div className="text-center py-20 animate-pulse">Loading product details...</div>;
    if (!product) return <div className="text-center py-20">Product not found.</div>;

    const currentPrice = selectedVariant?.price || product.basePrice;
    const currentStock = selectedVariant?.stock || product.stock;
    const isOutOfStock = currentStock <= 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-8 overflow-hidden relative group">
                        {product.images?.length > 0 ? (
                            <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="text-gray-300">No Image Available</div>
                        )}
                        {product.isBestSeller && (
                            <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                                BEST SELLER
                            </span>
                        )}
                        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Thumbnails if multiple images */}
                    {product.images?.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`w-20 h-20 rounded-lg border-2 flex-shrink-0 bg-white p-2 transition-all ${activeImage === idx ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <div className="mb-2 text-sm text-teal-600 font-bold uppercase tracking-wide">
                        {product.category?.name || 'Accessory'}
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{product.title}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">(12 reviews)</span>
                        {isOutOfStock ? (
                            <span className="text-sm text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
                        ) : (
                            <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">In Stock</span>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                        <div className="flex items-end gap-3 mb-2">
                            <span className="text-4xl font-black text-slate-900">₹{currentPrice}</span>
                            {product.basePrice > currentPrice && (
                                <div className="flex flex-col mb-1">
                                    <span className="text-lg text-gray-400 line-through">₹{product.basePrice}</span>
                                    <span className="text-xs text-red-500 font-bold">SAVE {Math.round((1 - currentPrice / product.basePrice) * 100)}%</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">Includes all taxes. Free shipping on this item.</p>
                    </div>

                    {/* Variant Selector */}
                    {product.hasVariants && (
                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-900 mb-3 flex justify-between">
                                <span>Select Model</span>
                                <span className="text-xs text-gray-500 font-normal">SKU: {selectedVariant?.sku || product.sku}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all min-w-[3rem] text-center
                                            ${selectedVariant === variant
                                                ? 'border-teal-500 bg-teal-600 text-white shadow-md shadow-teal-200'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {variant.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 mb-8">
                        <div className="flex-1">
                            <Button
                                size="lg"
                                disabled={isOutOfStock}
                                className="w-full flex items-center justify-center gap-2 h-14 text-lg"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isOutOfStock ? 'Notify Me' : 'Add to Cart'}
                            </Button>
                        </div>
                        <Button variant="outline" size="lg" className="h-14 px-8" disabled={isOutOfStock}>
                            Buy Now
                        </Button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                            <Truck className="w-5 h-5 text-teal-500 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Free Delivery</h4>
                                <p className="text-xs text-gray-500 mt-1">On orders over ₹499</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-teal-500 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">1 Year Warranty</h4>
                                <p className="text-xs text-gray-500 mt-1">Manufacturing defects</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="mt-20">
                <div className="border-b border-gray-200 mb-8">
                    <div className="flex gap-8 overflow-x-auto">
                        {['description', 'specifications', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 border-b-2 font-bold capitalize transition-colors whitespace-nowrap px-2
                                    ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-[200px] text-gray-600 leading-relaxed max-w-4xl">
                    {activeTab === 'description' && (
                        <div className="prose prose-slate max-w-none">
                            <p>{product.description || "No description available."}</p>
                            {/* Check if description has content, otherwise generic text */}
                            {!product.description && <p className="text-gray-400 italic">Product details coming soon.</p>}
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            {/* General Specs */}
                            {product.specs?.map((spec, idx) => (
                                <div key={idx} className="flex justify-between border-b border-gray-100 pb-2 group hover:bg-gray-50 px-2 rounded">
                                    <span className="font-medium text-gray-900">{spec.label}</span>
                                    <span>{spec.value}</span>
                                </div>
                            ))}

                            {/* Dynamic Attributes from Filterable Attributes can be shown here too if needed */}
                            {product.attributes && Object.entries(product.attributes).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-gray-100 pb-2 group hover:bg-gray-50 px-2 rounded">
                                    <span className="font-medium text-gray-900">{key}</span>
                                    <span>{val}</span>
                                </div>
                            ))}

                            {(!product.specs?.length && (!product.attributes || Object.keys(product.attributes).length === 0)) && (
                                <div className="col-span-2 text-center text-gray-400 py-10">
                                    No detailed specifications available.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                            <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <h3 className="font-bold text-gray-900">No reviews yet</h3>
                            <p className="text-gray-500 mb-4">Be the first to review this product!</p>
                            <Button variant="outline" size="sm">Write a Review</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map(rp => (
                            <Link to={`/product/${rp.slug || rp._id}`} key={rp._id} className="group bg-white rounded-xl border border-gray-100 p-4 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                    {rp.mainImage ? (
                                        <img src={rp.mainImage} alt={rp.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="text-gray-300 text-xs">No Image</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm min-h-[2.5em]" title={rp.title}>{rp.title}</h3>
                                <div className="mt-auto">
                                    <span className="text-lg font-extrabold text-slate-900">₹{rp.basePrice}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
