import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

const FilterSidebar = ({
    categories,
    activeCategorySlug,
    activeFilters,
    onFilterChange,
    onClearFilters
}) => {
    // Helper to find active category object
    const activeCategory = categories.find(c => c.slug === activeCategorySlug);

    // Filter categories to show hierarchy relevant to active one
    // Logic: Show Root Categories. If Root is active, show its children. 
    // If Child is active, show its siblings and parent.
    // Walker style: Sidebar is a tree.

    // Recursive Tree Renderer
    const renderCategoryTree = (parentId = null, depth = 0) => {
        const children = categories
            .filter(c => c.parent === parentId || (!c.parent && !parentId))
            .sort((a, b) => a.order - b.order);

        if (children.length === 0) return null;

        return (
            <ul className={`space-y-1 ${depth > 0 ? 'ml-4 mt-1 border-l border-gray-100 pl-2' : ''}`}>
                {children.map(cat => {
                    const isActive = cat.slug === activeCategorySlug;
                    const isAncestor = activeCategory && (
                        activeCategory._id === cat._id ||
                        activeCategory.ancestors?.includes(cat._id) // If we had ancestors populated
                        // Simplification: Check if active category is a child of this cat
                        // We need a better way to check ancestry on frontend or just rely on expanded state
                    );

                    // Allow expansion if it has children
                    const hasChildren = categories.some(c => c.parent === cat._id);
                    const isExpanded = isActive || hasChildren; // Simplified expansion

                    return (
                        <li key={cat._id}>
                            <a
                                href={`/c/${cat.slug}`}
                                className={`flex items-center justify-between text-sm py-1.5 hover:text-teal-600 transition-colors
                                    ${isActive ? 'text-teal-600 font-bold' : 'text-gray-600'}
                                `}
                            >
                                <span>{cat.name}</span>
                                {hasChildren && (
                                    <span className="text-gray-300">
                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </span>
                                )}
                            </a>
                            {hasChildren && isExpanded && renderCategoryTree(cat._id, depth + 1)}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Categories */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Categories</h3>
                {renderCategoryTree(null)}
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
