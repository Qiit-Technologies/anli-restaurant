'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { customerAuthService } from '@/services/customerAuth.service';
import { trackEvent, identifyUser } from '@/lib/mixpanel';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface CustomerLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchToSignup: () => void;
}

export default function CustomerLoginModal({
    isOpen,
    onClose,
    onSuccess,
    onSwitchToSignup,
}: CustomerLoginModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const handleLogin = async (data: LoginSchema) => {
        setLoading(true);
        try {
            const response = await customerAuthService.login(data.email, data.password);
            toast.success('Login successful');
            trackEvent('login_success', {
                email: data.email,
                user_id: response.id,
            });
            if (response.id) {
                identifyUser(String(response.id), {
                    email: data.email,
                    first_name: response.firstName,
                    last_name: response.lastName,
                });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Login failed';
            toast.error(errorMessage);
            trackEvent('login_failed', {
                email: data.email,
                error: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[14px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 pb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#3D2117]">
                        Welcome Back
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <div className="px-8 pb-10">
                    <p className="text-sm text-gray-400 mb-8">
                        To continue, enter your details
                    </p>

                    <form
                        onSubmit={form.handleSubmit(handleLogin)}
                        className="space-y-5"
                    >
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                {...form.register('email')}
                                type="email"
                                placeholder="Enter Email address"
                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3.5 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                            />
                            {form.formState.errors.email && (
                                <p className="text-red-500 text-[10px] mt-1 ml-1">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <input
                                {...form.register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter Password"
                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3.5 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 bottom-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                            {form.formState.errors.password && (
                                <p className="text-red-500 text-[10px] mt-1 ml-1">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-bold text-sm shadow-md hover:bg-blue-600 transition-all active:scale-95 disabled:bg-blue-300 mt-2"
                        >
                            {loading ? (
                                <div className="flex justify-center">
                                    <Loader2 className="animate-spin size-5" />
                                </div>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        {/* <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px bg-gray-100"></div>
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                or continue with
                            </span>
                            <div className="flex-1 h-px bg-gray-100"></div>
                        </div>

                        <div className="space-y-3">
                            <button className="w-full border border-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                                Google
                            </button>
                            <button className="w-full border border-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                                Facebook
                            </button>
                        </div> */}

                        <div className="mt-8 flex flex-col items-center gap-3">
                            <p className="text-xs text-gray-500">
                                Don&apos;t have an account?{' '}
                                <button
                                    onClick={onSwitchToSignup}
                                    className="text-[#FF8A00] font-bold"
                                >
                                    Signup
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
