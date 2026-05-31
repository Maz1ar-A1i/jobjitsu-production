import React, { useState } from 'react';
import { Formik, Field, ErrorMessage } from "formik";
import LoaderSpinner from "../../components/common/loader/loader.spinner";
import { forgotPassword } from "../../services/apis/authService";
import { createNotification } from "../../helpers/createNotifications";
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
});

const initialValues = {
    email: ""
};

const ForgotPassword = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoading(true);
        try {
            const res = await forgotPassword({ email: values.email });
            if (res && res.status === 1) {
                setIsSubmitted(true);
                createNotification("success", "Reset link sent to your email!");
            } else {
                createNotification("error", res?.errMsg || "Failed to send reset link");
            }
        } catch (error) {
            createNotification("error", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-background text-on-surface min-h-screen flex flex-col font-body">
                <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12 bg-mesh relative overflow-hidden">
                    <div className="w-full max-w-xl glass-panel p-8 rounded-[1.5rem] border border-outline-variant/10 shadow-2xl text-center relative overflow-hidden animate-fade-in-up">
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                                <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                            </div>
                            <h2 className="text-2xl font-headline font-black text-on-surface mb-3 tracking-tight">Check Your Email</h2>
                            <p className="text-on-surface-variant text-sm font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                                We've sent a secure reset link to your inbox. 
                                Secure your trajectory in just a few clicks.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:brightness-110">
                                    Back to Sign In
                                </Link>
                                <button 
                                    onClick={() => setIsSubmitted(false)}
                                    className="px-8 py-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] border border-outline-variant/10"
                                >
                                    Send Another Link
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col font-body">
            {/* Nav */}
            <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">
                    <div className="text-2xl font-black tracking-tighter text-on-surface uppercase font-headline">
                        JobJitsu<span className="text-primary">.</span>
                    </div>
                    <div className="hidden md:flex gap-8 items-center">
                        {['Product', 'Solutions', 'Pricing'].map(item => (
                            <a key={item} href="#" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium">{item}</a>
                        ))}
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link to="/login" className="text-sm text-on-surface hover:text-primary transition-colors font-bold">Sign In</Link>
                        <Link to="/signup" className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/10">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center px-6 pt-32 pb-16 bg-mesh relative overflow-hidden">
                <div className="w-full max-w-[1100px] grid md:grid-cols-2 rounded-[2.5rem] bg-surface-container-low/40 border border-outline-variant/10 shadow-2xl overflow-hidden glass-panel relative z-10 animate-fade-in-up">
                    
                    {/* Left Pane: Visual */}
                    <div className="hidden md:flex flex-col justify-center p-16 relative overflow-hidden bg-surface-container/30 border-r border-outline-variant/10">
                        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-luminosity">
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXB4Q648ZqD92meNfDidGS20GTQhbeoDOkFqR1c6-NG-t-Dyvxu2NFfvK3yV5RfsiiIwSiuqE3NG7nvmlKdSwYUamz415HGAbglfeNsfrRsb51R92yQBGBK1wz2UNFRTz68Tl-iJxFxtv90TjTWz66ell0xa4404sSUq5ZzVSBImep_04J3ws7FWu0W1KJFtmYtyDNXwD7pMZxzc-TIvVz8KIu5_Cli6NUPl5JKKKDNChx-ps6gqi8TJqy5knkhynqO0Frj3kWVDze"
                                alt="Abstract AI"
                                className="w-full h-full object-cover scale-110"
                            />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary/20 mb-6 backdrop-blur-md">
                                <span className="material-symbols-outlined text-secondary text-xs">psychology</span>
                                <span className="text-secondary text-[10px] font-bold tracking-[0.2em] uppercase font-label">AI Career Assistant</span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-headline font-black text-on-surface mb-4 leading-tight tracking-tighter">
                                Securing your <br/>
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">career path.</span>
                            </h2>
                            <p className="text-on-surface-variant leading-relaxed mb-10 max-w-sm font-medium">
                                Lost your access? Our AI-driven security layer will help you restore your credentials in seconds.
                            </p>
                            
                            <div className="p-5 rounded-2xl bg-surface-container-high/40 border border-outline-variant/10 backdrop-blur-sm flex items-start gap-4 group hover:border-primary/30 transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary">encrypted</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-on-surface">End-to-End Encryption</h4>
                                    <p className="text-xs text-on-surface-variant mt-1 font-medium leading-relaxed">Your reset links are cryptographically signed using advanced security protocols.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Form */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-transparent">
                        <div className="max-w-sm mx-auto w-full">
                            <div className="mb-8">
                                <h1 className="text-2xl font-headline font-black text-on-surface mb-2 tracking-tight">Forgot Password?</h1>
                                <p className="text-on-surface-variant text-xs font-medium">Enter your work email and we'll send a recovery link.</p>
                            </div>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ handleSubmit, isSubmitting }) => (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1 font-label">Work Email</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                                                <Field
                                                    name="email"
                                                    type="email"
                                                    placeholder="name@company.com"
                                                    className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-2xl py-5 pl-12 pr-4 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                                />
                                            </div>
                                            <ErrorMessage name="email" component="div" className="text-error text-xs ml-1 mt-1 font-medium px-2" />
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={isSubmitting || loading}
                                            className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center disabled:opacity-70"
                                        >
                                            {isSubmitting || loading ? (
                                                <LoaderSpinner color="white" size={20} />
                                            ) : (
                                                "Send Reset Link"
                                            )}
                                        </button>
                                    </form>
                                )}
                            </Formik>

                            <div className="mt-12 text-center">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-all font-black uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                    Back to Sign In
                                </Link>
                            </div>

                            {/* Security Pro-Tip */}
                            <div className="mt-16 p-6 rounded-2xl bg-tertiary-container/10 border border-tertiary/20 flex items-start gap-4 animate-pulse-slow">
                                <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
                                <div>
                                    <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mb-1">Security Pro-Tip</p>
                                    <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                                        Use a unique password for JobJitsu. AI analysis shows this reduces breach risk by <span className="text-tertiary font-bold">84%</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full py-12 px-12 flex flex-col md:flex-row justify-between items-center border-t border-outline-variant/10 bg-surface-container-lowest/30">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline-variant">© 2026 JobJitsu. AI Career Platform.</p>
                <div className="flex gap-8 mt-6 md:mt-0">
                    {['Privacy Policy', 'Terms of Service', 'Security', 'Status'].map(item => (
                        <a key={item} href="#" className="text-[10px] font-bold tracking-[0.2em] uppercase text-outline-variant hover:text-primary transition-colors">{item}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default ForgotPassword;

