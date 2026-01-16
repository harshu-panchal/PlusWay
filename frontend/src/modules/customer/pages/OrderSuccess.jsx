import { Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

const OrderSuccess = () => {
    return (
        <div className="mx-4 lg:mx-[10%] py-20 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for your purchase. We have received your order and are processing it. You will receive an email confirmation shortly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Home className="w-4 h-4" /> Return Home
                    </Button>
                </Link>
                <Link to="/products">
                    <Button className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Continue Shopping
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
