import { Routes, Route, Navigate } from 'react-router-dom';
import DeliveryLayout from '../layouts/DeliveryLayout';

// Auth Pages
import Login from '../pages/auth/Login';

// Protected Pages
import Dashboard from '../pages/Dashboard';
import DeliveryList from '../pages/deliveries/DeliveryList';
import DeliveryDetail from '../pages/deliveries/DeliveryDetail';
import Profile from '../pages/Profile';

const DeliveryRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes with Layout */}
            <Route element={<DeliveryLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<DeliveryList />} />
                <Route path="/orders/:id" element={<DeliveryDetail />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Redirect /delivery to /delivery/dashboard */}
            <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
        </Routes>
    );
};

export default DeliveryRoutes;
