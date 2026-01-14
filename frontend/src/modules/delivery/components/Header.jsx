import { NavLink } from 'react-router-dom';

const Header = () => {
    const navItems = [
        { path: '/delivery/dashboard', label: 'Dashboard' },
        { path: '/delivery/orders', label: 'Deliveries' },
        { path: '/delivery/profile', label: 'Profile' },
    ];

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800">Delivery Panel</span>
                    </div>

                    <nav className="flex items-center space-x-6">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <button className="text-gray-700 hover:text-red-600 font-medium">
                            Logout
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
