const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const categoryService = {
    getAllCategories: async () => {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return await response.json();
    },

    getCategoryBySlug: async (slug) => {
        const response = await fetch(`${API_URL}/categories/slug/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        return await response.json();
    },

    getCategoryById: async (id) => {
        const response = await fetch(`${API_URL}/categories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch category');
        return await response.json();
    }
};
