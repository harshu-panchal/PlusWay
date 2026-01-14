import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const DeliveryLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default DeliveryLayout;
