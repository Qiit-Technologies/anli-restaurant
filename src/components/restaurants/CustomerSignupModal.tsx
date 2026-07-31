'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { customerAuthService } from '@/services/customerAuth.service';
import { trackEvent, identifyUser } from '@/lib/mixpanel';
import { toast } from 'react-hot-toast';

const signupSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Invalid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const otpSchema = z.object({
    otp: z.string().length(4, 'OTP must be 4 digits'),
});

type SignupSchema = z.infer<typeof signupSchema>;
type OtpSchema = z.infer<typeof otpSchema>;

interface CustomerSignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

const COUNTRY_CODES = [
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+233', name: 'Ghana', flag: '🇬🇭' },
];

export default function CustomerSignupModal({
    isOpen,
    onClose,
    onSuccess,
    onSwitchToLogin,
}: CustomerSignupModalProps) {
    const [view, setView] = useState<'FORM' | 'OTP'>('FORM');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);

    const signupForm = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
        },
    });

    const otpForm = useForm<OtpSchema>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const handleSignup = async (data: SignupSchema) => {
        setLoading(true);
        try {
            const fullPhone = `${countryCode.code}${data.phoneNumber.replace(/^0+/, '')}`;
            await customerAuthService.register({
                ...data,
                phoneNumber: fullPhone,
            });
            setView('OTP');
            trackEvent('signup_initiated', {
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                phone: fullPhone,
            });
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Registration failed';
            toast.error(errorMessage);
            trackEvent('signup_failed', {
                email: data.email,
                error: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (data: OtpSchema) => {
        setLoading(true);
        try {
            const email = signupForm.getValues('email');
            const response = await customerAuthService.verifyOtp(email, data.otp);
            toast.success('Successfully authenticated');
            trackEvent('signup_success', {
                email,
                user_id: response.id,
            });
            if (response.id) {
                identifyUser(String(response.id), {
                    email,
                    first_name: response.firstName,
                    last_name: response.lastName,
                });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Invalid OTP';
            toast.error(errorMessage);
            trackEvent('signup_otp_failed', {
                email,
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
                        {view === 'FORM' ? 'Create Account' : 'Verify Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <div className="px-8 pb-10 flex-1 overflow-y-auto custom-scrollbar">
                    {view === 'FORM' && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-gray-400 mb-8">
                                To Get started, fill in your details
                            </p>

                            <form
                                onSubmit={signupForm.handleSubmit(handleSignup)}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            First Name
                                        </label>
                                        <input
                                            {...signupForm.register(
                                                'firstName',
                                            )}
                                            placeholder="John"
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                                        />
                                        {signupForm.formState.errors
                                            .firstName && (
                                                <p className="text-red-500 text-[10px] mt-1 ml-1">
                                                    {
                                                        signupForm.formState.errors
                                                            .firstName.message
                                                    }
                                                </p>
                                            )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <input
                                            {...signupForm.register('lastName')}
                                            placeholder="Doe"
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                                        />
                                        {signupForm.formState.errors
                                            .lastName && (
                                                <p className="text-red-500 text-[10px] mt-1 ml-1">
                                                    {
                                                        signupForm.formState.errors
                                                            .lastName.message
                                                    }
                                                </p>
                                            )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        {...signupForm.register('email')}
                                        type="email"
                                        placeholder="Enter Email address"
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                    {signupForm.formState.errors.email && (
                                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                                            {
                                                signupForm.formState.errors
                                                    .email.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Phone Number
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsCountryModalOpen(
                                                        !isCountryModalOpen,
                                                    )
                                                }
                                                className="h-[46px] bg-white border border-[#E2E8F0] rounded-xl px-3 flex items-center gap-1.5 text-sm text-gray-700 font-bold hover:bg-gray-50 transition-all"
                                            >
                                                <span>{countryCode.flag}</span>
                                                <span>{countryCode.code}</span>
                                                <ChevronDown size={14} />
                                            </button>

                                            {isCountryModalOpen && (
                                                <div className="absolute bottom-full left-0 mb-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-bottom-2">
                                                    {COUNTRY_CODES.map((c) => (
                                                        <button
                                                            key={c.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setCountryCode(
                                                                    c,
                                                                );
                                                                setIsCountryModalOpen(
                                                                    false,
                                                                );
                                                            }}
                                                            className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 text-left transition-all"
                                                        >
                                                            <span className="text-lg">
                                                                {c.flag}
                                                            </span>
                                                            <span className="flex-1 text-xs text-gray-700">
                                                                {c.name}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-orange-500">
                                                                {c.code}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            {...signupForm.register(
                                                'phoneNumber',
                                            )}
                                            type="tel"
                                            placeholder="Enter Phone Number"
                                            className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                    {signupForm.formState.errors
                                        .phoneNumber && (
                                            <p className="text-red-500 text-[10px] mt-1 ml-1">
                                                {
                                                    signupForm.formState.errors
                                                        .phoneNumber.message
                                                }
                                            </p>
                                        )}
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <input
                                        {...signupForm.register('password')}
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        placeholder="Enter Password"
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-3 px-5 text-sm text-gray-700 focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-4 bottom-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                    {signupForm.formState.errors.password && (
                                        <p className="text-red-500 text-[10px] mt-1 ml-1">
                                            {
                                                signupForm.formState.errors
                                                    .password.message
                                            }
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#007AFF] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-600 transition-all active:scale-95 disabled:bg-blue-300 mt-2"
                                >
                                    {loading ? (
                                        <div className="flex justify-center">
                                            <Loader2 className="animate-spin size-5" />
                                        </div>
                                    ) : (
                                        'Signup'
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
                                        Already have an account?{' '}
                                        <button
                                            onClick={onSwitchToLogin}
                                            className="text-[#FF8A00] font-bold"
                                        >
                                            Login
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'OTP' && (
                        <div className="animate-in slide-in-from-right-4 duration-300 text-center py-6">
                            <p className="text-sm text-gray-400 mb-8">
                                Please enter the code sent to your email
                            </p>

                            <form
                                onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                                className="space-y-8"
                            >
                                <div>
                                    <input
                                        {...otpForm.register('otp')}
                                        placeholder="0000"
                                        maxLength={4}
                                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-6 text-center text-4xl font-black text-[#3D2117] tracking-[0.5rem] focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-100"
                                    />
                                    {otpForm.formState.errors.otp && (
                                        <p className="text-red-500 text-[10px] mt-3">
                                            {
                                                otpForm.formState.errors.otp
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#FF8A00] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-orange-600 transition-all active:scale-95 disabled:bg-orange-300"
                                    >
                                        {loading ? (
                                            <div className="flex justify-center">
                                                <Loader2 className="animate-spin size-5" />
                                            </div>
                                        ) : (
                                            'Verify Code'
                                        )}
                                    </button>

                                    <p className="text-xs text-gray-500">
                                        Didn&apos;t receive code?{' '}
                                        <button
                                            type="button"
                                            className="text-[#FF8A00] font-bold hover:underline"
                                        >
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
