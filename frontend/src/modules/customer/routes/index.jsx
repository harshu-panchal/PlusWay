import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import ProtectedRoute from '../../../shared/components/ProtectedRoute';

// Auth Pages
import CustomerLogin from '../pages/CustomerLogin';
import CustomerSignup from '../pages/CustomerSignup';

// Public Pages
import Home from '../pages/Home';
import ProductListing from '../pages/ProductListing';
import ProductDetail from '../pages/ProductDetail';

// Protected Pages
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import Profile from '../pages/Profile';
import OrderSuccess from '../pages/OrderSuccess';
import Wishlist from '../pages/Wishlist';

const CustomerRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/signup" element={<CustomerSignup />} />

            {/* Public Routes with Layout */}
            <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/:category" element={<ProductListing />} />
                <Route path="/:category/:subcategory" element={<ProductListing />} />
                <Route path="/:category/:subcategory/:subsubcategory" element={<ProductListing />} />

                <Route path="/product/:slug" element={<ProductDetail />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                </Route>
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default CustomerRoutes;
