import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CustomerLayout from '../layouts/CustomerLayout';
import ProtectedRoute from '../../../shared/components/ProtectedRoute';
import Loader from '../../../shared/components/ui/Loader';

// Auth Pages (Lazy)
const CustomerLogin = lazy(() => import('../pages/CustomerLogin'));
const CustomerSignup = lazy(() => import('../pages/CustomerSignup'));

// Public Pages (Lazy)
const Home = lazy(() => import('../pages/Home'));
const ProductListing = lazy(() => import('../pages/ProductListing'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));

// Protected Pages (Lazy)
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const Profile = lazy(() => import('../pages/Profile'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const Wishlist = lazy(() => import('../pages/Wishlist'));

const CustomerRoutes = () => {
    return (
        <Suspense fallback={<Loader fullScreen />}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<CustomerLogin />} />
                <Route path="/signup" element={<CustomerSignup />} />

                {/* Public Routes with Layout */}
                <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductListing />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />

                    {/* Protected Routes - Accessible by Customers and Admins for testing */}
                    <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:id" element={<OrderDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                    </Route>

                    {/* Dynamic Category Routes - Last for lowest priority */}
                    <Route path="/:category" element={<ProductListing />} />
                    <Route path="/:category/:subcategory" element={<ProductListing />} />
                    <Route path="/:category/:subcategory/:subsubcategory" element={<ProductListing />} />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default CustomerRoutes;
