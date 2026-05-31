import React, { useState } from 'react';
import { Formik, Field, ErrorMessage } from "formik";
import LoaderSpinner from "../../components/common/loader/loader.spinner";
import { register } from "../../services/apis/authService";
import { createNotification } from "../../helpers/createNotifications";
import { signupValidation } from "../../features/auth/utils/validation";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import GoogleLogin from "../login/components/GoogleLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Removed inline validationSchema in favor of shared signupValidation

const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
};

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        if (!values.termsAccepted) {
            createNotification("error", "You must agree to the Terms of Service and Privacy Policy.");
            setSubmitting(false);
            return;
        }
        setLoading(true);
        try {
            const res = await register({
                name: values.name,
                email: values.email,
                password: values.password
            });

            if (res && res.status === 1) {
                createNotification("success", "Account created successfully! Please log in.");
                resetForm();
                navigate('/login');
            } else {
                createNotification("error", res?.errMsg || "Failed to create account");
            }
        } catch (error) {
            createNotification("error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary/30 font-body transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">
                    <div className="text-2xl font-black tracking-tighter text-on-surface uppercase font-headline">
                        JobJitsu<span className="text-primary">.</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm text-on-surface-variant hidden sm:inline">Already a member?</span>
                        <Link to="/login" className="px-5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-sm transition-all active:scale-95">
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 bg-mesh relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse-slow delay-1000"></div>

                <div className="container max-w-6xl grid md:grid-cols-2 gap-10 items-center">
                    {/* Left Pane: Branding/Value Prop */}
                    <div className="hidden md:block space-y-6 animate-fade-in-up">
                        <div className="space-y-4">
                            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20">
                                AI Career Assistant
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-headline font-black leading-tight text-on-surface tracking-tighter">
                                Master your <br />
                                <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">career evolution</span>
                            </h1>
                            <p className="text-base text-on-surface-variant max-w-md leading-relaxed font-medium">
                                Access your personalized interview coach and career trajectory insights.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <div className="p-5 rounded-[1.25rem] bg-surface-container-low border border-outline-variant/10 glass-panel group hover:border-primary/30 transition-all duration-500">
                                <span className="material-symbols-outlined text-primary mb-2 text-2xl group-hover:scale-110 transition-transform">neurology</span>
                                <div className="text-on-surface font-bold font-headline text-base">AI Prep</div>
                                <div className="text-on-surface-variant text-xs mt-1 leading-relaxed font-medium">Real-time interview simulation.</div>
                            </div>
                            <div className="p-5 rounded-[1.25rem] bg-surface-container-low border border-outline-variant/10 glass-panel group hover:border-secondary/30 transition-all duration-500">
                                <span className="material-symbols-outlined text-secondary mb-2 text-2xl group-hover:scale-110 transition-transform">insights</span>
                                <div className="text-on-surface font-bold font-headline text-base">Skill Analysis</div>
                                <div className="text-on-surface-variant text-xs mt-1 leading-relaxed font-medium">Visualize your market growth.</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Sign-Up Card */}
                    <div className="w-full flex justify-center animate-fade-in-up delay-200">
                        <div className="w-full max-w-sm glass-panel p-8 rounded-[1.5rem] border border-outline-variant/10 shadow-2xl relative overflow-hidden">
                            {/* Inner Accent Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>

                            <div className="mb-6 text-center md:text-left">
                                <h2 className="text-2xl font-headline font-black text-on-surface mb-2 tracking-tight">Create Account</h2>
                                <p className="text-on-surface-variant text-xs font-medium">Start your journey with the AI Career Assistant.</p>
                            </div>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={signupValidation}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, handleSubmit }) => (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors">person</span>
                                                <Field
                                                    name="name"
                                                    type="text"
                                                    placeholder="Alex Sterling"
                                                    className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-secondary/50 focus:ring-4 focus:ring-secondary/10 transition-all font-medium"
                                                />
                                            </div>
                                            <ErrorMessage name="name" component="div" className="text-error text-xs ml-1 mt-1 font-medium" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Work Email</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">alternate_email</span>
                                                <Field
                                                    name="email"
                                                    type="email"
                                                    placeholder="name@company.com"
                                                    className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                                />
                                            </div>
                                            <ErrorMessage name="email" component="div" className="text-error text-xs ml-1 mt-1 font-medium" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                                                <Field
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface-variant transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            <ErrorMessage name="password" component="div" className="text-error text-xs ml-1 mt-1 font-medium" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock_reset</span>
                                                <Field
                                                    name="confirmPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface-variant transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xl">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            <ErrorMessage name="confirmPassword" component="div" className="text-error text-xs ml-1 mt-1 font-medium" />
                                        </div>

                                        <div className="flex items-start gap-3 py-2">
                                            <Field
                                                type="checkbox"
                                                name="termsAccepted"
                                                id="terms"
                                                className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary focus:ring-offset-background"
                                            />
                                            <label htmlFor="terms" className="text-[10px] text-on-surface-variant leading-relaxed font-bold uppercase tracking-wider">
                                                I agree to the <button type="button" className="text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-all">Terms of Service</button> and acknowledge the <button type="button" className="text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-all">Privacy Policy</button>.
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || loading}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center disabled:opacity-70"
                                        >
                                            {isSubmitting || loading ? (
                                                <LoaderSpinner color="white" size={20} />
                                            ) : (
                                                "Create Account"
                                            )}
                                        </button>
                                    </form>
                                )}
                            </Formik>

                            <div className="relative my-8 text-center">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
                                <span className="relative bg-surface-container-high/50 px-4 text-[10px] font-bold uppercase tracking-widest text-outline-variant">Or continue with</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                <GoogleOAuthProvider clientId="910723846023-4dso5qvaefgnv1eqcobvhufmu0n11794.apps.googleusercontent.com">
                                    <GoogleLogin />
                                </GoogleOAuthProvider>
                            </div>

                            <p className="mt-6 text-center text-xs text-on-surface-variant font-medium">
                                Already a member? <Link to="/login" className="text-primary font-black uppercase tracking-widest hover:underline transition-all">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Updated Footer */}
            <footer className="w-full py-10 px-12 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-xs">verified</span>
                    </div>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">
                        © 2026 JobJitsu. AI Career Orchestration.
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                    <Link to="/privacy" className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Privacy Policy</Link>
                    <Link to="/terms" className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Terms of Service</Link>
                    <Link to="/security" className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Security</Link>
                    <button className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Status</button>
                </div>
            </footer>
        </div>
    );
};

export default Signup;

