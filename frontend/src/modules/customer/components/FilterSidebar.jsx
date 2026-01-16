import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FilterSidebar = ({
    categories,
    activeCategorySlug,
    activeFilters,
    onFilterChange,
    onClearFilters,
    currentPath, // New prop: the current URL path like "/schutzglas/fuer-iphone-550"
    onLocalSearch // New prop: callback to set local search filter
}) => {
    // Helper to find active category object
    const activeCategory = categories.find(c => c.slug === activeCategorySlug);

    // Filter Logic:
    // 1. If active category has children -> Show active category as Header, Children as list.
    // 2. If active category has NO children (Leaf) -> Show Parent as Header, Siblings (Parent's children) as list.
    // 3. Keep "Parent" context when clicking siblings.

    let displayCategory = activeCategory;
    let subcategories = [];

    if (activeCategory) {
        // Check for children
        const children = categories
            .filter(c => c.parent === activeCategory._id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (children.length > 0) {
            // Case 1: Has children (Parent Node)
            subcategories = children;
            displayCategory = activeCategory;
        } else if (activeCategory.parent) {
            // Case 2: Leaf node, show siblings
            const parent = categories.find(c => c._id === activeCategory.parent);
            if (parent) {
                displayCategory = parent;
                subcategories = categories
                    .filter(c => c.parent === parent._id)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        }
    }

    // Build nested URL for a subcategory
    const buildNestedUrl = (subcategory) => {
        if (currentPath) {
            // If the active category matches the display category (Header),
            // it means we are at the Parent level, so we append the child slug.
            if (displayCategory?._id === activeCategory?._id) {
                return `${currentPath}/${subcategory.slug}`;
            }
            // If they don't match, we are at the Child (Leaf) level.
            // So we want to switch siblings by replacing the last segment.
            else {
                const parts = currentPath.split('/');
                // Handle edge case where split might result in empty parts (e.g. leading /)
                // Assuming well-formed paths from router
                return `${parts.slice(0, -1).join('/')}/${subcategory.slug}`;
            }
        }
        return `/c/${subcategory.slug}`;
    };

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Current Category with Subcategories - Walker Style */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                {/* Active Category as heading */}
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">
                    {displayCategory?.name || 'Categories'}
                    {displayCategory?.productCount && (
                        <span className="text-gray-400 font-normal"> ({displayCategory.productCount})</span>
                    )}
                </h3>

                {/* Show only subcategories of the current category */}
                {subcategories.length > 0 ? (
                    <ul className="space-y-1">
                        {subcategories.map(cat => {
                            const isActive = cat.slug === activeCategorySlug;
                            const nestedUrl = buildNestedUrl(cat);

                            // Check if this subcategory is a leaf (has no children)
                            const hasChildren = categories.some(c => c.parent === cat._id);
                            const isLeafCategory = !hasChildren;

                            // For leaf categories, use button to set local search instead of navigation
                            if (isLeafCategory && onLocalSearch) {
                                return (
                                    <li key={cat._id}>
                                        <button
                                            onClick={() => onLocalSearch(cat.name)}
                                            className={`flex items-center justify-between text-sm py-1.5 hover:text-teal-600 transition-colors w-full text-left
                                                ${isActive ? 'text-teal-600 font-bold' : 'text-gray-600'}
                                            `}
                                        >
                                            <span>{cat.name}</span>
                                            {cat.productCount && (
                                                <span className="text-gray-400 text-xs">({cat.productCount})</span>
                                            )}
                                        </button>
                                    </li>
                                );
                            }

                            return (
                                <li key={cat._id}>
                                    <Link
                                        to={nestedUrl}
                                        className={`flex items-center justify-between text-sm py-1.5 hover:text-teal-600 transition-colors
                                            ${isActive ? 'text-teal-600 font-bold' : 'text-gray-600'}
                                        `}
                                    >
                                        <span>{cat.name}</span>
                                        {cat.productCount && (
                                            <span className="text-gray-400 text-xs">({cat.productCount})</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">No subcategories</p>
                )}
            </div>

            {/* Price Filter */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Price</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={activeFilters.minPrice || ''}
                        onChange={(e) => onFilterChange('minPrice', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-teal-500 outline-none"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={activeFilters.maxPrice || ''}
                        onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-teal-500 outline-none"
                    />
                </div>
            </div>

            {/* Attributes Filters */}
            {activeCategory?.filterableAttributes?.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h3 className="font-bold text-gray-900">Filters</h3>
                        {Object.keys(activeFilters).length > 0 && (
                            <button
                                onClick={onClearFilters}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {activeCategory.filterableAttributes.map(attr => (
                            <div key={attr}>
                                <h4 className="text-sm font-semibold text-gray-800 mb-2">{attr}</h4>
                                {/* 
                                    Ideally we need available values for this attribute from backend aggregation.
                                    Since we don't have aggregation yet, we render a text input or placeholder.
                                    Walker has checkboxes.
                                    For now, we will assume we get 'facets' prop or just render a simple input 
                                    until aggregation is ready.
                                    Let's use a Text Input for now to prove concept.
                                */}
                                <input
                                    type="text"
                                    placeholder={`Filter by ${attr}`}
                                    value={activeFilters[attr] || ''}
                                    onChange={(e) => onFilterChange(attr, e.target.value)}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-teal-500 outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};

export default FilterSidebar;
