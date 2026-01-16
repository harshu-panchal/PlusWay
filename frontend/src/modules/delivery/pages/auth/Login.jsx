import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../../../store/authSlice';
import Card from '../../../../shared/components/ui/Card';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const resultAction = await dispatch(login({ email, password }));
        if (login.fulfilled.match(resultAction)) {
            const user = resultAction.payload.user;
            if (user.role === 'delivery') {
                navigate('/delivery/dashboard');
            } else {
                setError('Access denied. This portal is for delivery boys only.');
                // We should probably logout here if we want to be strict
            }
        } else {
            setError(resultAction.payload || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Delivery Boy Login</h1>
                    <p className="text-gray-500 mt-2">Enter your credentials to access the delivery portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                        <Input
                            type="email"
                            placeholder="delivery@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-3 text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/delivery/signup" className="text-primary font-bold hover:underline">
                            Sign up now
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
