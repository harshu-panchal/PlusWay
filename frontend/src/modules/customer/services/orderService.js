const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getIdentifyParams = () => {
    const params = {};
    const guestId = localStorage.getItem('guestId');
    if (guestId) params.guestId = guestId;
    return params;
};

export const orderService = {
    createOrder: async (shippingAddress) => {
        const body = {
            ...getIdentifyParams(),
            shippingAddress
        };
        const response = await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create order');
        }
        return await response.json();
    },

    verifyPayment: async (paymentData) => {
        const response = await fetch(`${API_URL}/orders/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Payment verification failed');
        }
        return await response.json();
    },

    getMyOrders: async () => {
        const response = await fetch(`${API_URL}/orders/my-orders`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch orders');
        }
        return await response.json();
    }
};
