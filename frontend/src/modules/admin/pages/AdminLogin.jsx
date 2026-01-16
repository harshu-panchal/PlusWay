import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../../store/authSlice';
import { Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            // Toast or alert
        }

        if (isSuccess || user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                // If a customer tries to login via admin portal
                alert('You are not authorized as admin');
                dispatch(reset()); // Reset state to clear logged in customer
                // ideally logout the user
            }
        }

        return () => {
            dispatch(reset());
        };
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <ShieldCheck className="h-12 w-12 text-indigo-500" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Restricted Access
                    </p>
                </div>

                {isError && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-200">{message}</p>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none rounded-t-lg relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none rounded-b-lg relative block w-full px-10 py-3 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-indigo-500/50"
                        >
                            Access Dashboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
