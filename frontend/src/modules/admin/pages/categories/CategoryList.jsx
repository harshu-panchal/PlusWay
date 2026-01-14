import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Modal from '../../../../shared/components/ui/Modal';
import CategoryForm from './CategoryForm';
import { Plus, Edit, Trash, FolderTree } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
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
                        .sort((a, b) => a.name.localeCompare(b.name)) // Optional: sort by name
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
            }
        } catch (error) {
            console.error('Failed to save category', error);
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
        <div className="flex gap-6 items-start">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                    <Button onClick={handleAdd} icon={Plus}>
                        Add Category
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Name (Hierarchy)</th>
                                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Slug</th>
                                    <th className="text-right py-4 px-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-10">Loading...</td></tr>
                                ) : visibleCategories.map((category) => (
                                    <tr key={category._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div style={{ paddingLeft: `${category.level * 24}px` }} className="flex items-center">
                                                {/* Toggle Button */}
                                                {hasChildren(category._id) ? (
                                                    <button
                                                        onClick={() => toggleExpand(category._id)}
                                                        className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors text-gray-500"
                                                    >
                                                        <span className="inline-block w-4 h-4 text-xs">
                                                            {expanded[category._id] ? '▼' : '▶'}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <span className="w-6 mr-2"></span> // Spacer
                                                )}

                                                <FolderTree className={`w-4 h-4 mr-2 ${category.level === 0 ? 'text-teal-600' : 'text-gray-400'}`} />
                                                <span className={`font-medium ${category.level === 0 ? 'text-gray-900 group-hover:text-teal-600' : 'text-gray-600'}`}>
                                                    {category.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 text-sm">{category.slug || '-'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingCategory ? "Edit Category" : "Add New Category"}
            >
                <CategoryForm
                    category={editingCategory}
                    categories={categories}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default CategoryList;
