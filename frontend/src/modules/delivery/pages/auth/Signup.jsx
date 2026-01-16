import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { register } from '../../../../store/authSlice';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicleType: 'bike',
        vehicleNumber: ''
    });
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/auth/register-delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // We could dispatch a custom register thunk if we had one for delivery,
                // but since raw fetch gives us token, we can just login or redirect to login.
                // For simplicity, let's redirect to login for now or handle token.
                alert('Registration successful! Please login.');
                navigate('/delivery/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred during registration');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-xl p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Become a Delivery Partner</h1>
                    <p className="text-gray-500 mt-2">Join our network and start delivering today</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <Input
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <Input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                            <Input
                                name="phone"
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Vehicle Type</label>
                            <select
                                name="vehicleType"
                                value={formData.vehicleType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            >
                                <option value="bike">Bike</option>
                                <option value="scooter">Scooter</option>
                                <option value="cycle">Cycle</option>
                                <option value="car">Car</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Vehicle Number</label>
                            <Input
                                name="vehicleNumber"
                                placeholder="KA 03 EX 1234"
                                value={formData.vehicleNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3 text-lg mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Register as Partner'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-600">
                        Already have a partner account?{' '}
                        <Link to="/delivery/login" className="text-primary font-bold hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Signup;
