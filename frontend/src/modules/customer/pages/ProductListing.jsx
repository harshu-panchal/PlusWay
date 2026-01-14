import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import Button from '../../../shared/components/ui/Button';

const ProductListing = () => {
    const { category, subcategory, subsubcategory } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // Determine the active category slug from the deepest URL parameter
    const slug = subsubcategory || subcategory || category;

    // Data State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // UI State
    const [activeFilters, setActiveFilters] = useState({});
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('popularity'); // popularity, price_asc, price_desc, newest

    // 1. Fetch Categories (Hierarchy) Once
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    // 2. Fetch Products when slug, sort, or filters change
    useEffect(() => {
        const loadProducts = async () => {
            setLoadingProducts(true);
            try {
                // Separate attributes from standard filters
                const { minPrice, maxPrice, ...attributes } = activeFilters;

                const filters = {
                    categorySlug: slug,
                    sort: sortBy,
                    attributes: attributes,
                    minPrice,
                    maxPrice
                };
                const data = await productService.getAllProducts(filters);
                setProducts(data.products || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, [slug, sortBy, activeFilters]);

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => {
            const next = { ...prev };
            if (value === '' || value === null) {
                delete next[key];
            } else {
                next[key] = value;
            }
            return next;
        });
    };

    const clearFilters = () => {
        setActiveFilters({});
    };

    const activeCategory = categories.find(c => c.slug === slug);

    // Generate Breadcrumbs
    const breadcrumbItems = useMemo(() => {
        if (!slug || categories.length === 0) return [];

        const crumbs = [];
        let current = activeCategory;

        while (current) {
            crumbs.unshift({
                label: current.name,
                path: `/c/${current.slug}` // Ideally this should reconstruct the full nested path
            });
            // Move up to parent
            if (current.parent) {
                current = categories.find(c => c._id === current.parent);
            } else {
                current = null;
            }
        }

        // Fix paths to matching nested URL structure if possible, 
        // OR just simpler: use the slugs we have from useParams for the known path
        // BUT, traversing up gives us the content names.
        // Let's rely on the simple `/c/:slug` redirect or just use the reconstructed path if we knew the hierarchy.
        // For now, let's correct the paths in the loop.

        // Better approach with known params:
        const items = [];
        if (category) {
            const catObj = categories.find(c => c.slug === category);
            items.push({ label: catObj?.name || category, path: `/${category}` });
        }
        if (subcategory) {
            const subObj = categories.find(c => c.slug === subcategory);
            items.push({ label: subObj?.name || subcategory, path: `/${category}/${subcategory}` });
        }
        if (subsubcategory) {
            const subSubObj = categories.find(c => c.slug === subsubcategory);
            items.push({ label: subSubObj?.name || subsubcategory, path: `/${category}/${subcategory}/${subsubcategory}` });
        }
        return items;

    }, [categories, category, subcategory, subsubcategory, activeCategory]);


    return (
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs items={breadcrumbItems} />

            {/* Header section with sort and mobile filter toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{activeCategory?.name || 'All Products'}</h1>
                    {slug && <p className="text-slate-500 text-sm mt-1">Found {products.length} items</p>}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
                        >
                            <option value="popularity">Popularity</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium"
                    >
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block fixed inset-0 z-40 lg:static lg:z-auto bg-white lg:bg-transparent overflow-y-auto lg:overflow-visible`}>
                    {/* Mobile Close Button */}
                    <div className="lg:hidden p-4 border-b flex justify-between items-center bg-white sticky top-0">
                        <span className="font-bold text-lg">Filters</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>Close</Button>
                    </div>

                    <div className="p-4 lg:p-0">
                        <FilterSidebar
                            categories={categories}
                            activeCategorySlug={slug}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={clearFilters}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 min-h-[500px]">
                    {loading || loadingProducts ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4]"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                            <p className="text-gray-500">Try adjusting your filters or category.</p>
                            <button onClick={clearFilters} className="mt-4 text-teal-600 font-medium hover:underline">Clear all filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="group bg-white rounded-xl border border-gray-100 p-4 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col">
                                    <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                                        {/* Badges */}
                                        {(product.isNewArrival || product.isBestSeller) && (
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                {product.isNewArrival && <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>}
                                                {product.isBestSeller && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">HOT</span>}
                                            </div>
                                        )}

                                        {product.mainImage ? (
                                            <img src={product.mainImage} alt={product.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="text-gray-300 text-xs">No Image</div>
                                        )}

                                        {/* Quick View trigger could go here */}
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <p className="text-xs text-teal-600 font-bold mb-1 uppercase tracking-wider line-clamp-1">{product.category?.name}</p>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm min-h-[2.5em]" title={product.title}>{product.title}</h3>

                                        <div className="mt-auto flex items-end justify-between">
                                            <div className="flex flex-col">
                                                {product.basePrice * 1.2 > product.basePrice && (
                                                    <span className="text-xs text-gray-400 line-through">₹{Math.round(product.basePrice * 1.2)}</span>
                                                )}
                                                <span className="text-lg font-extrabold text-slate-900">₹{product.basePrice}</span>
                                            </div>
                                            {product.hasVariants && (
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                                                    {product.variants.length} Options
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
