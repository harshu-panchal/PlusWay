import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../../../store/authSlice';
import { Mail, Lock, AlertCircle, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    // Get the path to redirect back to, default to home
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (isSuccess || user) {
            navigate(from, { replace: true });
        }

        return () => {
            dispatch(reset());
        };
    }, [user, isSuccess, navigate, dispatch, from]);

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

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
            {/* Left Side: Brand/Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10 max-w-md text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/20"
                    >
                        <Zap className="w-10 h-10 text-white fill-current" />
                    </motion.div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
                        Elevate Your Mobile <span className="text-teal-400">Experience.</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Join PlusWay to discover premium mobile accessories designed for style and durability.
                    </p>
                </div>

                <div className="absolute bottom-12 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-500" /> Secure Login</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                    <span>Verified Store</span>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-gray-50/50">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md w-full"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white fill-current" />
                            </div>
                            <span className="font-black tracking-tighter text-slate-900">PLUSWAY</span>
                        </Link>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Welcome Back</h2>
                        <p className="text-slate-500 font-medium">Log in to manage your orders and wishlist.</p>
                    </div>

                    {isError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-100 p-4 mb-8 rounded-2xl flex items-start gap-3"
                        >
                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 font-medium leading-relaxed">{message}</p>
                        </motion.div>
                    )}

                    <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                                    <a href="#" className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            New to PlusWay?{' '}
                            <Link
                                to="/signup"
                                className="text-teal-600 font-black hover:text-teal-700 transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CustomerLogin;
