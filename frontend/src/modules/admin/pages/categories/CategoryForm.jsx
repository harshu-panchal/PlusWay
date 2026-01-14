import { useState, useEffect } from 'react';
import Card from '../../../../shared/components/ui/Card';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import { Save, X, Plus } from 'lucide-react';

const CategoryForm = ({ category, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        parent: '',
        level: 0,
        filterableAttributes: []
    });
    const [loading, setLoading] = useState(false);
    const [newAttribute, setNewAttribute] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                parent: category.parent || '',
                level: category.level,
                filterableAttributes: category.filterableAttributes || []
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addAttribute = () => {
        if (!newAttribute.trim()) return;
        if (formData.filterableAttributes.includes(newAttribute.trim())) return;

        setFormData(prev => ({
            ...prev,
            filterableAttributes: [...prev.filterableAttributes, newAttribute.trim()]
        }));
        setNewAttribute('');
    };

    const removeAttribute = (index) => {
        setFormData(prev => ({
            ...prev,
            filterableAttributes: prev.filterableAttributes.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Calculate level based on parent
        let level = 0;
        if (formData.parent) {
            const parentCat = categories.find(c => c._id === formData.parent);
            if (parentCat) level = parentCat.level + 1;
        }

        await onSave({ ...formData, level });
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Parent Category (Optional)</label>
                <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                    <option value="">None (Root Category)</option>
                    {categories
                        .filter(c => c._id !== category?._id) // Prevent self-parenting
                        .map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {'- '.repeat(cat.level)} {cat.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Filterable Attributes</label>
                <p className="text-xs text-gray-400 mb-2">Define attributes that can be used to filter products in this category (e.g. "Material", "Hardness").</p>

                <div className="flex gap-2 mb-2">
                    <Input
                        placeholder="Add new attribute..."
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addAttribute();
                            }
                        }}
                    />
                    <Button type="button" onClick={addAttribute} icon={Plus} variant="outline">Add</Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {formData.filterableAttributes.map((attr, index) => (
                        <div key={index} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-teal-100">
                            {attr}
                            <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="hover:text-teal-900"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {formData.filterableAttributes.length === 0 && (
                        <span className="text-sm text-gray-400 italic">No attributes defined.</span>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={loading} icon={Save}>
                    {category ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>

    );
};

export default CategoryForm;
