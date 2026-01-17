import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import DeliveryLayout from '../layouts/DeliveryLayout';
import ProtectedRoute from '../../../shared/components/ProtectedRoute';
import Loader from '../../../shared/components/ui/Loader';

// Auth Pages (Lazy)
const Login = lazy(() => import('../pages/auth/Login'));
const Signup = lazy(() => import('../pages/auth/Signup'));

// Protected Pages (Lazy)
const Dashboard = lazy(() => import('../pages/Dashboard'));
const DeliveryList = lazy(() => import('../pages/deliveries/DeliveryList'));
const DeliveryDetail = lazy(() => import('../pages/deliveries/DeliveryDetail'));
const Profile = lazy(() => import('../pages/Profile'));

const DeliveryRoutes = () => {
    return (
        <Suspense fallback={<Loader fullScreen />}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes with Layout */}
                <Route element={<ProtectedRoute allowedRoles={['delivery']} redirectPath="/delivery/login" />}>
                    <Route element={<DeliveryLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/orders" element={<DeliveryList />} />
                        <Route path="/orders/:id" element={<DeliveryDetail />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                {/* Redirect /delivery to /delivery/dashboard */}
                <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
            </Routes>
        </Suspense>
    );
};

export default DeliveryRoutes;
