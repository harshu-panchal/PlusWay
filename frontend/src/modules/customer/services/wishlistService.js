import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const wishlistService = {
    getWishlist: async () => {
        const response = await axios.get(`${API_URL}/wishlist`, getHeaders());
        return response.data;
    },

    toggleItem: async (productId) => {
        const response = await axios.post(`${API_URL}/wishlist/toggle/${productId}`, {}, getHeaders());
        return response.data;
    }
};
