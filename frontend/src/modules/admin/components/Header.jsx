import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    // Simple breadcrumb logic
    const pathnames = location.pathname.split('/').filter((x) => x && x !== 'admin');
    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
        : 'Dashboard';

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h2 className="text-xl font-bold text-slate-800">{pageTitle}</h2>

                    <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-xl w-72 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="bg-transparent border-none focus:outline-none text-sm w-full"
                        />
                        <span className="text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <button className="relative p-2.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-white font-bold">A</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">Admin User</p>
                            <p className="text-[11px] text-slate-500 font-medium">Administrator</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

