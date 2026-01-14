const API_URL = 'http://localhost:5000/api';

export const productService = {
    getAllProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.categorySlug) queryParams.append('categorySlug', params.categorySlug);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        if (params.sort) queryParams.append('sort', params.sort);

        // Handle dynamic attributes (e.g. attributes[Brand]=Apple)
        if (params.attributes) {
            Object.keys(params.attributes).forEach(key => {
                queryParams.append(`attributes[${key}]`, params.attributes[key]);
            });
        }

        const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    },

    getProductBySlug: async (slug) => {
        const response = await fetch(`${API_URL}/products/slug/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    },

    getProductById: async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    },

    getCategories: async () => {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return await response.json();
    }
};
