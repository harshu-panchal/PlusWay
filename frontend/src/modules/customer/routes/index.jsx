import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Public Pages
import Home from '../pages/Home';
import ProductListing from '../pages/ProductListing';
import ProductDetail from '../pages/ProductDetail';

// Protected Pages (will add auth guard later)
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import Profile from '../pages/Profile';

const CustomerRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Routes with Layout */}
            <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/:category" element={<ProductListing />} />
                <Route path="/:category/:subcategory" element={<ProductListing />} />
                <Route path="/:category/:subcategory/:subsubcategory" element={<ProductListing />} />

                <Route path="/product/:id" element={<ProductDetail />} />

                {/* Protected Routes */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default CustomerRoutes;
