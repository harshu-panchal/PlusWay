import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

// Auth Pages
import Login from '../pages/auth/Login';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/products/ProductList';
import ProductForm from '../pages/products/ProductForm';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import CustomerList from '../pages/customers/CustomerList';
import Settings from '../pages/Settings';
import CategoryList from '../pages/categories/CategoryList';
import BannerList from '../pages/settings/BannerList';

const AdminRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes with Layout */}
            <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/categories" element={<CategoryList />} />
                <Route path="/banners" element={<BannerList />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/add" element={<ProductForm />} />
                <Route path="/products/edit/:id" element={<ProductForm />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Redirect /admin to /admin/dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
    );
};

export default AdminRoutes;
