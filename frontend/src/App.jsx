import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import CustomerRoutes from './modules/customer/routes';
import AdminRoutes from './modules/admin/routes';
import DeliveryRoutes from './modules/delivery/routes';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from './modules/customer/store/slices/wishlistSlice';
import { fetchCart } from './modules/customer/store/slices/cartSlice';
import { checkAuth } from './store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    // Fetch cart for guest or user
    dispatch(fetchCart());

    // Fetch wishlist only if user is authenticated
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Customer Routes - Base path / */}
        <Route path="/*" element={<CustomerRoutes />} />

        {/* Admin Routes - Base path /admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Delivery Routes - Base path /delivery */}
        <Route path="/delivery/*" element={<DeliveryRoutes />} />
      </Routes>
    </div>
  );
}

export default App;
