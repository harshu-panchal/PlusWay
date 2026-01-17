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
            <div className="mx-4 lg:mx-0 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
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
                <p className="text-slate-500 text-sm mt-1">Found {pagination.total} items</p>
            </div>

            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
                {/* Search */}
                <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Filter Button - Mobile Only */}
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex-1 sm:flex-none justify-center min-h-[44px]"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters</span>
                    </button>

                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white text-sm flex-1 sm:flex-none min-h-[44px]"
                    >
                        <option value="">Sort by</option>
                        <option value="popularity">Popularity</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A-Z</option>
                        <option value="name_desc">Name: Z-A</option>
                        <option value="newest">Newest Arrivals</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                    <FilterSidebar
                        categories={categories}
                        activeCategorySlug={slug}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                        currentPath={location.pathname}
                        onLocalSearch={setLocalSearch}
                    />
                </div>

                {/* Mobile Filter Sidebar */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowMobileFilters(false)}
                        ></div>

                        {/* Sidebar */}
                        <div className="absolute inset-y-0 left-0 w-full sm:w-80 bg-white shadow-xl overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 sm:p-6">
                                <FilterSidebar
                                    categories={categories}
                                    activeCategorySlug={slug}
                                    activeFilters={activeFilters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={clearFilters}
                                    currentPath={location.pathname}
                                    onLocalSearch={setLocalSearch}
                                />
                            </div>
                        </div>
                    </div>
                )}

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm min-h-[44px]"
                            >
                                Previous
                            </button>
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm min-w-[44px] min-h-[44px] flex items-center justify-center ${currentPage === i + 1
                                                ? 'bg-teal-500 text-white'
                                                : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm min-h-[44px]"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
