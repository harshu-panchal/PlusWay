import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../../services/wishlistService';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
    try {
        const data = await wishlistService.getWishlist();
        return data.data; // Assuming API returns { status, data: [] }
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
});

export const toggleWishlistItem = createAsyncThunk('wishlist/toggle', async (product, { rejectWithValue }) => {
    try {
        await wishlistService.toggleItem(product._id);
        return product; // Return product to optimistic update
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to toggle wishlist item');
    }
});

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleWishlistItem.fulfilled, (state, action) => {
                const product = action.payload;
                const exists = state.items.find(p => p._id === product._id);
                if (exists) {
                    state.items = state.items.filter(p => p._id !== product._id);
                } else {
                    state.items.push(product);
                }
            });
    }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
