// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',

    // Products
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id) => `/products/${id}`,

    // Categories
    CATEGORIES: '/categories',

    // Cart
    CART: '/cart',
    ADD_TO_CART: '/cart/add',
    UPDATE_CART: '/cart/update',
    REMOVE_FROM_CART: '/cart/remove',

    // Orders
    ORDERS: '/orders',
    ORDER_BY_ID: (id) => `/orders/${id}`,
    CREATE_ORDER: '/orders/create',

    // Users
    USERS: '/users',
    USER_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile/update',

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_CUSTOMERS: '/admin/customers',

    // Delivery
    DELIVERY_ORDERS: '/delivery/orders',
    UPDATE_DELIVERY_STATUS: '/delivery/update-status',
};

// App Routes
export const ROUTES = {
    // Customer Routes
    HOME: '/',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDERS: '/orders',
    ORDER_DETAIL: '/orders/:id',
    PROFILE: '/profile',
    LOGIN: '/login',
    REGISTER: '/register',

    // Admin Routes
    ADMIN_LOGIN: '/admin/login',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_PRODUCT_ADD: '/admin/products/add',
    ADMIN_PRODUCT_EDIT: '/admin/products/edit/:id',
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_ORDER_DETAIL: '/admin/orders/:id',
    ADMIN_CUSTOMERS: '/admin/customers',
    ADMIN_SETTINGS: '/admin/settings',

    // Delivery Routes
    DELIVERY_LOGIN: '/delivery/login',
    DELIVERY_DASHBOARD: '/delivery/dashboard',
    DELIVERY_ORDERS: '/delivery/orders',
    DELIVERY_ORDER_DETAIL: '/delivery/orders/:id',
    DELIVERY_PROFILE: '/delivery/profile',
};

// Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CART: 'cart',
    THEME: 'theme',
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};

// User Roles
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    DELIVERY: 'delivery',
};
