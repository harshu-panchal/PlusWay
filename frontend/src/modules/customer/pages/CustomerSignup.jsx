import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../../store/authSlice';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

const CustomerSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            // Toast or alert usually goes here
        }

        if (isSuccess || user) {
            navigate('/');
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

        if (password !== confirmPassword) {
            alert('Passwords do not match');
        } else {
            dispatch(register({ name, email, password }));
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="mx-4 lg:mx-[10%] min-h-screen flex items-center justify-center bg-gray-50 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us and start shopping
                    </p>
                </div>

                {isError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-700">{message}</p>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative mb-4">
                            <label htmlFor="name" className="sr-only">
                                Full Name
                            </label>
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Full Name"
                                value={name}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Email address"
                                value={email}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative mb-4">
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Password"
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={onChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Sign up
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerSignup;
