import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';
import Card from '../../../../shared/components/ui/Card';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement admin login logic
        console.log('Admin Login:', formData);
        navigate('/admin/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">A</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
                    <p className="text-gray-600">Sign in to access admin panel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter admin email"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                    />

                    <Button type="submit" className="w-full" size="lg">
                        Sign In
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Login;
