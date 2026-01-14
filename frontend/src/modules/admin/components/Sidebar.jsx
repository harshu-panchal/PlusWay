import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/categories', label: 'Categories', icon: '📂' },
        { path: '/admin/products', label: 'Products', icon: '📦' },
        { path: '/admin/orders', label: 'Orders', icon: '🛒' },
        { path: '/admin/customers', label: 'Customers', icon: '👥' },
        { path: '/admin/banners', label: 'Banners', icon: '🖼️' },
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
