import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../../../shared/components/ProtectedRoute';

// Auth Pages
import AdminLogin from '../pages/AdminLogin';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/products/ProductList';
import ProductForm from '../pages/products/ProductForm';
import FeaturedManagement from '../pages/products/FeaturedManagement';
import OrderList from '../pages/orders/OrderList';
import OrderDetail from '../pages/orders/OrderDetail';
import CustomerList from '../pages/customers/CustomerList';
import CustomerDetail from '../pages/customers/CustomerDetail';
import Settings from '../pages/Settings';
import CategoryList from '../pages/categories/CategoryList';
import BrandList from '../pages/brands/BrandList';
import BannerList from '../pages/settings/BannerList';
import StockList from '../pages/inventory/StockList';
import FinancialDashboard from '../pages/finance/FinancialDashboard';
import TransactionList from '../pages/finance/TransactionList';
import Analytics from '../pages/Analytics';
import DeliveryBoyList from '../pages/delivery-boys/DeliveryBoyList';
import ReviewList from '../pages/reviews/ReviewList';
import DealList from '../pages/deals/DealList';
import DealForm from '../pages/deals/DealForm';

const AdminRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login" />}>
                <Route element={<AdminLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/categories" element={<CategoryList />} />
                    <Route path="/brands" element={<BrandList />} />
                    <Route path="/banners" element={<BannerList />} />
                    <Route path="/inventory" element={<StockList />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/add" element={<ProductForm />} />
                    <Route path="/products/edit/:id" element={<ProductForm />} />
                    <Route path="/featured-management" element={<FeaturedManagement />} />
                    <Route path="/orders" element={<OrderList />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/customers" element={<CustomerList />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/reviews" element={<ReviewList />} />
                    <Route path="/finance" element={<FinancialDashboard />} />
                    <Route path="/finance/transactions" element={<TransactionList />} />
                    <Route path="/delivery-boys" element={<DeliveryBoyList />} />
                    <Route path="/deals" element={<DealList />} />
                    <Route path="/deals/new" element={<DealForm />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Route>

            {/* Redirect /admin to /admin/dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
    );
};

export default AdminRoutes;
