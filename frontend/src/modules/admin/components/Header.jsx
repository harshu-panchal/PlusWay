const Header = () => {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>

                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-600 hover:text-gray-800">
                        <span className="text-2xl">🔔</span>
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">A</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Admin User</p>
                            <p className="text-xs text-gray-500">admin@mobileshop.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
