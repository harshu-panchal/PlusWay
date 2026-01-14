import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement registration logic
        console.log('Register:', formData);
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Sign up to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        error={errors.name}
                        required
                    />

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
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        error={errors.phone}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        error={errors.password}
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        error={errors.confirmPassword}
                        required
                    />

                    <div className="flex items-start">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500" required />
                        <span className="ml-2 text-sm text-gray-600">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                                Terms and Conditions
                            </Link>
                        </span>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Register;
