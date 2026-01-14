import { Routes, Route } from 'react-router-dom';
import CustomerRoutes from './modules/customer/routes';
import AdminRoutes from './modules/admin/routes';
import DeliveryRoutes from './modules/delivery/routes';

function App() {
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
