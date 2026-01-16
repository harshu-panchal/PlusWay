import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Filter, SlidersHorizontal, ArrowUpDown, Search, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import Button from '../../../shared/components/ui/Button';

const ProductListing = () => {
    const { category, subcategory, subsubcategory } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // Determine the active category slug from the deepest URL parameter
    const slug = subsubcategory || subcategory || category;

    // Get search query from URL params
    const searchQuery = searchParams.get('search') || '';
    const pageParam = parseInt(searchParams.get('page') || '1');
    const isFeaturedParam = searchParams.get('isFeatured');
    const isNewArrivalParam = searchParams.get('isNewArrival');

    // Data State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // UI State
    const [activeFilters, setActiveFilters] = useState({});
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('popularity'); // popularity, price_asc, price_desc, newest
    const [localSearch, setLocalSearch] = useState(''); // Local search within category

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

    // 2. Fetch Products when slug, sort, filters, or search change
    useEffect(() => {
        const loadProducts = async () => {
            setLoadingProducts(true);
            try {
                // Separate attributes from standard filters
                const { minPrice, maxPrice, ...attributes } = activeFilters;

                // Use localSearch when in category, otherwise use URL search query
                const effectiveSearch = localSearch || searchQuery;

                const filters = {
                    categorySlug: slug,
                    sort: sortBy,
                    attributes: attributes,
                    minPrice,
                    maxPrice,
                    search: effectiveSearch,
                    page: pageParam,
                    isFeatured: isFeaturedParam === 'true',
                    isNewArrival: isNewArrivalParam === 'true',
                };
                const data = await productService.getAllProducts(filters);
                setProducts(data.products || []);
                setPagination({
                    page: data.page || 1,
                    pages: data.pages || 1,
                    total: data.total || 0
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
                setLoadingProducts(false);
            }
        };
        loadProducts();
    }, [slug, sortBy, activeFilters, searchQuery, localSearch, pageParam, isFeaturedParam, isNewArrivalParam]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setSearchParams(prev => {
                prev.set('page', newPage);
                return prev;
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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

    // Build currentPath from URL params for nested URL construction
    // e.g., if we're at /schutzglas/fuer-iphone-550, currentPath = "/schutzglas/fuer-iphone-550"
    const currentPath = useMemo(() => {
        const parts = [];
        if (category) parts.push(category);
        if (subcategory) parts.push(subcategory);
        if (subsubcategory) parts.push(subsubcategory);
        return parts.length > 0 ? '/' + parts.join('/') : '';
    }, [category, subcategory, subsubcategory]);

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
        <div className="mx-4 lg:mx-[10%] py-8">
            <Breadcrumbs items={breadcrumbItems} />

            {/* Header section with sort and mobile filter toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {localSearch ? localSearch : (searchQuery ? `Search: "${searchQuery}"` : (activeCategory?.name || 'All Products'))}
                    </h1>
                    {localSearch && (
                        <p className="text-teal-600 text-sm mt-1 flex items-center gap-2">
                            Filtering in {activeCategory?.name || 'All Products'}
                            <button
                                onClick={() => setLocalSearch('')}
                                className="text-xs text-gray-400 hover:text-red-500 underline"
                            >
                                Clear filter
                            </button>
                        </p>
                    )}
                    <p className="text-slate-500 text-sm mt-1">Found {products.length} items</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {/* Local Search within category */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search in this category..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-48 sm:w-64 pl-4 pr-10 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        />
                        {localSearch ? (
                            <button
                                onClick={() => setLocalSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        )}
                    </div>

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
                            currentPath={currentPath}
                            onLocalSearch={setLocalSearch}
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
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex bg-white rounded-lg border border-gray-200 shadow-sm">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-r border-gray-200 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-r border-gray-200">
                                    Page {pagination.page} of {pagination.pages}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
