import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';
import { clearCart } from './cartSlice';

export const createOrder = createAsyncThunk('orders/create', async (shippingAddress, { rejectWithValue }) => {
    try {
        return await orderService.createOrder(shippingAddress);
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const verifyPayment = createAsyncThunk('orders/verify', async (paymentData, { rejectWithValue, dispatch }) => {
    try {
        const result = await orderService.verifyPayment(paymentData);
        // Dispatch clearCart to update frontend state after successful payment
        dispatch(clearCart());
        return result;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// Fetch My Orders
export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
    try {
        return await orderService.getMyOrders();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        currentOrder: null, // { id, razorpayOrderId, amount ... }
        orders: [], // List of user orders
        loading: false,
        error: null,
        paymentStatus: 'idle', // idle, processing, success, failed
    },
    reducers: {
        resetOrderState: (state) => {
            state.currentOrder = null;
            state.loading = false;
            state.error = null;
            state.paymentStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify Payment
            .addCase(verifyPayment.pending, (state) => {
                state.paymentStatus = 'processing';
            })
            .addCase(verifyPayment.fulfilled, (state) => {
                state.paymentStatus = 'success';
                state.currentOrder = null; // Clear current order on success
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.error = action.payload;
            })
            // Fetch My Orders
            .addCase(fetchMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
