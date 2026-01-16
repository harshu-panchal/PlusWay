import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

// Thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
    try {
        return await cartService.getCart();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const addToCart = createAsyncThunk('cart/addToCart', async ({ productId, quantity, variant }, { rejectWithValue }) => {
    try {
        const data = await cartService.addToCart(productId, quantity, variant);
        // We could also show a toast here via a middleware or callback
        return data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
        return await cartService.updateItem(itemId, quantity);
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
    try {
        return await cartService.removeItem(itemId);
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
    try {
        return await cartService.clearCart();
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// Helper to calculate totals
const calculateTotals = (items) => {
    if (!items) return { quantity: 0, amount: 0 };
    return items.reduce((acc, item) => {
        const price = item.variant?.price || item.product?.discountPrice || item.product?.basePrice || 0;
        return {
            quantity: acc.quantity + item.quantity,
            amount: acc.amount + (price * item.quantity)
        };
    }, { quantity: 0, amount: 0 });
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
        loading: false,
        error: null,
        isOpen: false // UI state for drawer
    },
    reducers: {
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                const totals = calculateTotals(state.items);
                state.totalQuantity = totals.quantity;
                state.totalAmount = totals.amount;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addToCart.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                const totals = calculateTotals(state.items);
                state.totalQuantity = totals.quantity;
                state.totalAmount = totals.amount;
                state.isOpen = true; // Open cart on add
            })
            // Update
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                const totals = calculateTotals(state.items);
                state.totalQuantity = totals.quantity;
                state.totalAmount = totals.amount;
            })
            // Remove
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                const totals = calculateTotals(state.items);
                state.totalQuantity = totals.quantity;
                state.totalAmount = totals.amount;
            })
            // Clear
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.totalQuantity = 0;
                state.totalAmount = 0;
            });
    }
});

export const { toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
