import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Modal from '../../../../shared/components/ui/Modal';
import Badge from '../../../../shared/components/ui/Badge';
import CategoryForm from './CategoryForm';
import { Plus, Edit, Trash, FolderTree, FolderPlus, ChevronRight, ChevronDown, Search, MoreVertical } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [defaultParentForNew, setDefaultParentForNew] = useState('');
    const [expanded, setExpanded] = useState({});

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`);
            if (response.ok) {
                const data = await response.json();

                // Helper to rebuild tree from flat data
                const buildCategoryTree = (categories, parentId = null, level = 0) => {
                    return categories
                        .filter(cat => (cat.parent || null) === parentId)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .reduce((acc, cat) => {
                            return [...acc, { ...cat, level }, ...buildCategoryTree(categories, cat._id, level + 1)];
                        }, []);
                };

                const sortedData = buildCategoryTree(data);
                setCategories(sortedData);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = () => {
        setEditingCategory(null);
        setDefaultParentForNew('');
        setIsFormOpen(true);
    };

    const handleAddSubCategory = (parentId) => {
        setEditingCategory(null);
        setDefaultParentForNew(parentId);
        setIsFormOpen(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const response = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchCategories();
            }
        } catch (error) {
            console.error('Failed to delete category', error);
        }
    };

    const handleSave = async (formData) => {
        try {
            const url = editingCategory
                ? `${API_URL}/categories/${editingCategory._id}`
                : `${API_URL}/categories`;

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsFormOpen(false);
                fetchCategories();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Failed to save category', error);
            alert('An unexpected error occurred');
        }
    };

    const toggleExpand = (categoryId) => {
        setExpanded(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    // Helper to check if category has children
    const hasChildren = (categoryId) => categories.some(c => c.parent === categoryId);

    // Filter visible categories based on expanded state
    const visibleCategories = categories.filter(cat => {
        if (cat.level === 0) return true;

        // Find parent
        const parent = categories.find(p => p._id === cat.parent);
        if (!parent) return false;

        // Recursively check if all ancestors are expanded
        let current = parent;
        while (current) {
            if (!expanded[current._id]) return false;
            if (!current.parent) break;
            current = categories.find(p => p._id === current.parent);
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
                    <p className="text-slate-500 text-sm">Organize your products into a nested hierarchy.</p>
                </div>
                <Button onClick={handleAdd} icon={Plus} size="sm">
                    Add Category
                </Button>
            </div>

            <Card padding={false} className="overflow-hidden border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Hierarchy & Name</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="py-6 px-6">
                                            <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : visibleCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <FolderTree className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-medium">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visibleCategories.map((category) => (
                                    <tr key={category._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div
                                                style={{ paddingLeft: `${category.level * 2}rem` }}
                                                className="flex items-center gap-3"
                                            >
                                                {/* Toggle Button */}
                                                <div className="w-6 flex items-center justify-center">
                                                    {hasChildren(category._id) ? (
                                                        <button
                                                            onClick={() => toggleExpand(category._id)}
                                                            className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
                                                        >
                                                            {expanded[category._id] ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                    )}
                                                </div>

                                                <div className={`p-2 rounded-lg ${category.level === 0 ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400'} overflow-hidden`}>
                                                    {category.icon && category.level === 0 ? (
                                                        <img
                                                            src={category.icon}
                                                            alt={category.name}
                                                            className="w-4 h-4 object-cover rounded"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <FolderTree className="w-4 h-4" />
                                                    )}
                                                </div>

                                                <span className={`font-bold transition-colors ${category.level === 0 ? 'text-slate-800' : 'text-slate-600 text-sm'
                                                    } group-hover:text-primary-600`}>
                                                    {category.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <code className="text-[11px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-mono">
                                                {category.slug || '-'}
                                            </code>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant="success" size="sm">Active</Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="relative flex justify-end items-center min-h-[32px]">
                                                {/* Default Actions (Visible when not hovered) */}
                                                <div className="group-hover:opacity-0 transition-opacity duration-200 flex items-center">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </div>

                                                {/* Hover Actions (Visible on hover) */}
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-end gap-1 pointer-events-none group-hover:pointer-events-auto p-1">
                                                    <button
                                                        onClick={() => handleAddSubCategory(category._id)}
                                                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                                                        title="Add Subcategory"
                                                    >
                                                        <FolderPlus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash className="w-4 h-4" />
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
            </Card>

            {/* Modal Form */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCategory ? "Edit Category" : "Add New Category"}
            >
                <CategoryForm
                    category={editingCategory}
                    categories={categories}
                    defaultParent={defaultParentForNew}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default CategoryList;

