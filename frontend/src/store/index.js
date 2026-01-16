import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from '../modules/customer/store/slices/cartSlice';
import wishlistReducer from '../modules/customer/store/slices/wishlistSlice';
import orderReducer from '../modules/customer/store/slices/orderSlice';
import adminOrderReducer from '../modules/admin/store/slices/adminOrderSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        order: orderReducer,
        adminOrder: adminOrderReducer
    },
});

export default store;
