import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement login logic
        console.log('Login:', formData);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        error={errors.email}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        error={errors.password}
                        required
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
