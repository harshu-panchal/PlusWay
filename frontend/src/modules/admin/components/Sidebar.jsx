import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderTree,
    ClipboardList,
    Package,
    ShoppingCart,
    Users,
    Banknote,
    Image as ImageIcon,
    Settings,
    LogOut,
    TrendingUp,
    Truck,
    Star,
    Tag // Added
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        { path: '/admin/categories', label: 'Categories', icon: FolderTree },
        { path: '/admin/brands', label: 'Brands', icon: Tag },
        { path: '/admin/inventory', label: 'Inventory', icon: ClipboardList },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { path: '/admin/delivery-boys', label: 'Delivery Team', icon: Truck },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/featured-management', label: 'Featured & New', icon: Star },
        { path: '/admin/reviews', label: 'Reviews', icon: Star }, // Added Reviews link
        { path: '/admin/deals', label: 'Deal of the Day', icon: Tag }, // Added Deal of the Day
        { path: '/admin/finance', label: 'Finance', icon: Banknote },
        { path: '/admin/banners', label: 'Banners', icon: ImageIcon },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Package className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">PlusWay</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Admin Portal</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-4 mb-4">Main Menu</p>
                <ul className="space-y-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                            ? 'bg-teal-500/10 text-teal-400 font-semibold'
                                            : 'hover:bg-slate-800 hover:text-white'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-400' : 'group-hover:text-white'}`} />
                                            <span>{item.label}</span>
                                            {/* Active Indicator */}
                                            <div
                                                className={isActive ? "ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" : "hidden"}
                                            />
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 mt-auto border-t border-slate-800">
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
