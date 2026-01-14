import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
            <Link to="/" className="flex items-center hover:text-teal-600 transition-colors">
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-300 flex-shrink-0" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-teal-600 transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-bold">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
