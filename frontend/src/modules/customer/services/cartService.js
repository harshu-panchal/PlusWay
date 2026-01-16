const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getGuestId = () => {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('guestId', guestId);
    }
    return guestId;
};

// Helper to get params (userId from token if implemented, else guestId)
// For now assuming we pass guestId unless userId is explicit
const getIdentifyParams = () => {
    const params = {};
    const guestId = getGuestId();
    params.guestId = guestId;

    // TODO: If we had a user token, we'd extract userId or pass token in header
    // const user = JSON.parse(localStorage.getItem('user'));
    // if (user?._id) params.userId = user._id;

    return params;
};

export const cartService = {
    getCart: async () => {
        const params = new URLSearchParams(getIdentifyParams());
        const response = await fetch(`${API_URL}/cart?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch cart');
        return await response.json();
    },

    addToCart: async (productId, quantity, variant) => {
        const body = {
            ...getIdentifyParams(),
            productId,
            quantity,
            variant
        };
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        return await response.json();
    },

    updateItem: async (itemId, quantity) => {
        const body = {
            ...getIdentifyParams(),
            itemId,
            quantity
        };
        const response = await fetch(`${API_URL}/cart/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to update cart item');
        return await response.json();
    },

    removeItem: async (itemId) => {
        const body = {
            ...getIdentifyParams(),
            itemId
        };
        const response = await fetch(`${API_URL}/cart/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to remove cart item');
        return await response.json();
    },

    clearCart: async () => {
        const body = { ...getIdentifyParams() };
        const response = await fetch(`${API_URL}/cart/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to clear cart');
        return await response.json();
    }
};
