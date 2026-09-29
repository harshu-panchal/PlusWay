import { NavLink, useNavigate } from 'react-router-dom';
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
    Tag,
    Zap,
    MessageSquare,
} from 'lucide-react';

const navSections = [
    {
        label: 'Overview',
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        ],
    },
    {
        label: 'Catalog',
        items: [
            { path: '/admin/categories', label: 'Categories', icon: FolderTree },
            { path: '/admin/brands', label: 'Brands', icon: Tag },
            { path: '/admin/products', label: 'Products', icon: Package },
            { path: '/admin/inventory', label: 'Inventory', icon: ClipboardList },
        ],
    },
    {
        label: 'Commerce',
        items: [
            { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            { path: '/admin/finance', label: 'Finance', icon: Banknote },
            { path: '/admin/deals', label: 'Deal of the Day', icon: Tag },
        ],
    },
    {
        label: 'Content',
        items: [
            { path: '/admin/featured-management', label: 'Featured & New', icon: Star },
            { path: '/admin/banners', label: 'Banners', icon: ImageIcon },
            { path: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
        ],
    },
    {
        label: 'People',
        items: [
            { path: '/admin/customers', label: 'Customers', icon: Users },
            { path: '/admin/delivery-boys', label: 'Delivery Team', icon: Truck },
        ],
    },
];

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin/login');
    };

    return (
        <aside className="w-64 flex flex-col bg-[#0f1117] border-r border-white/5 shadow-2xl">

            {/* Logo */}
            <div className="px-5 py-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" fill="currentColor" />
                    </div>
                    <div className="leading-none">
                        <span className="text-white font-black text-lg tracking-tight">Mobhub</span>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold mt-0.5">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
                {navSections.map((section) => (
                    <div key={section.label}>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 font-bold px-3 mb-1.5">
                            {section.label}
                        </p>
                        <ul className="space-y-0.5">
                            {section.items.map(({ path, label, icon: Icon }) => (
                                <li key={path}>
                                    <NavLink
                                        to={path}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                                isActive
                                                    ? 'bg-teal-500/10 text-teal-400'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-full" />
                                                )}
                                                <Icon
                                                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                                        isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                                                    }`}
                                                />
                                                <span>{label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) =>
                        `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                            isActive
                                ? 'bg-teal-500/10 text-teal-400'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <Settings className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Settings</span>
                        </>
                    )}
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-red-400 transition-colors" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
