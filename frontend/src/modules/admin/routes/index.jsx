import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../../../shared/components/ProtectedRoute';
import Loader from '../../../shared/components/ui/Loader';

// Auth Pages (Lazy)
const AdminLogin = lazy(() => import('../pages/AdminLogin'));

// Protected Pages (Lazy)
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProductList = lazy(() => import('../pages/products/ProductList'));
const ProductForm = lazy(() => import('../pages/products/ProductForm'));
const FeaturedManagement = lazy(() => import('../pages/products/FeaturedManagement'));
const OrderList = lazy(() => import('../pages/orders/OrderList'));
const OrderDetail = lazy(() => import('../pages/orders/OrderDetail'));
const CustomerList = lazy(() => import('../pages/customers/CustomerList'));
const CustomerDetail = lazy(() => import('../pages/customers/CustomerDetail'));
const Settings = lazy(() => import('../pages/Settings'));
const CategoryList = lazy(() => import('../pages/categories/CategoryList'));
const BrandList = lazy(() => import('../pages/brands/BrandList'));
const BannerList = lazy(() => import('../pages/settings/BannerList'));
const StockList = lazy(() => import('../pages/inventory/StockList'));
const FinancialDashboard = lazy(() => import('../pages/finance/FinancialDashboard'));
const TransactionList = lazy(() => import('../pages/finance/TransactionList'));
const Analytics = lazy(() => import('../pages/Analytics'));
const DeliveryBoyList = lazy(() => import('../pages/delivery-boys/DeliveryBoyList'));
const ReviewList = lazy(() => import('../pages/reviews/ReviewList'));
const DealList = lazy(() => import('../pages/deals/DealList'));
const DealForm = lazy(() => import('../pages/deals/DealForm'));

const AdminRoutes = () => {
    return (
        <Suspense fallback={<Loader fullScreen />}>
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
        </Suspense>
    );
};

export default AdminRoutes;
