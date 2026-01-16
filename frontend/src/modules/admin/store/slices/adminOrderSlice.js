import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fetch All Orders (Admin)
export const fetchAllOrders = createAsyncThunk('adminOrder/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
            params // Pass query params to axios
        };

        const response = await axios.get(`${API_URL}/orders/admin/all`, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
});

// Update Order Status
export const updateOrderStatus = createAsyncThunk('adminOrder/updateStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true
        };

        const response = await axios.put(`${API_URL}/orders/${id}/status`, { status }, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
});

const adminOrderSlice = createSlice({
    name: 'adminOrder',
    initialState: {
        orders: [],
        pagination: {
            page: 1,
            pages: 1,
            total: 0
        },
        currentOrder: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        clearAdminOrderState: (state) => {
            state.error = null;
            state.success = false;
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = state.orders.find(o => o._id === action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                // Check if payload has new structure with pagination or legacy array
                if (Array.isArray(action.payload)) {
                    state.orders = action.payload;
                    state.pagination = { page: 1, pages: 1, total: action.payload.length };
                } else {
                    state.orders = action.payload.orders || [];
                    state.pagination = {
                        page: action.payload.page || 1,
                        pages: action.payload.pages || 1,
                        total: action.payload.total || 0
                    };
                }
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                // Update the order in the list
                const index = state.orders.findIndex(o => o._id === action.payload._id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                if (state.currentOrder && state.currentOrder._id === action.payload._id) {
                    state.currentOrder = action.payload;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAdminOrderState, setCurrentOrder } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
