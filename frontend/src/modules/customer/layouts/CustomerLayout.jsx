import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

const CustomerLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pb-20 lg:pb-0">
                <Outlet />
            </main>
            <div className="hidden lg:block">
                <Footer />
            </div>
            <BottomNav />
        </div>
    );
};

export default CustomerLayout;

