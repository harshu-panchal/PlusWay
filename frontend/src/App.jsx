import { Routes, Route } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from './modules/customer/store/slices/wishlistSlice';
import { fetchCart } from './modules/customer/store/slices/cartSlice';
import { checkAuth } from './store/authSlice';
import Loader from './shared/components/ui/Loader';

// Lazy load modules
const CustomerRoutes = lazy(() => import('./modules/customer/routes'));
const AdminRoutes = lazy(() => import('./modules/admin/routes'));
const DeliveryRoutes = lazy(() => import('./modules/delivery/routes'));

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
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* Customer Routes - Base path / */}
          <Route path="/*" element={<CustomerRoutes />} />

          {/* Admin Routes - Base path /admin */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Delivery Routes - Base path /delivery */}
          <Route path="/delivery/*" element={<DeliveryRoutes />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
