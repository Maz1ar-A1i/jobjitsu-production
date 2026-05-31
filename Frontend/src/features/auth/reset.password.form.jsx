import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import LoaderSpinner from "../../components/common/loader/loader.spinner";
import { updatePasswordValidation as validationSchema } from "../../features/auth/utils/validation";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { resetPassword } from "../../services/apis/authService";
import { createNotification } from "../../helpers/createNotifications";

const initialValues = {
    email: "",
    password: "",
    confirmPassword: ""
};

const ResetPasswordForm = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const token = useRef();
    const navigate = useNavigate();
    const authState = useSelector(state => state.auth);
    const { loggedIn, currentUser } = authState || {};

    useEffect(() => {
        const urlToken = searchParams.get("token");
        if (urlToken) {
            token.current = urlToken;
            // Optionally clear params but keep them in ref
        }
    }, [searchParams]);

    useEffect(() => {
        if (loggedIn && currentUser?.token) {
            token.current = currentUser.token;
        }
    }, [loggedIn, currentUser]);

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoading(true);
        try {
            const body = { 
                email: values.email, 
                newPassword: values.password,
                token: token.current 
            };
            
            const res = await resetPassword(body);
            if (res && res.status === 1) {
                createNotification("success", "Password updated successfully");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                createNotification("error", res?.errMsg || "Failed to update password");
            }
        } catch (error) {
            createNotification("error", "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    const submitText = loggedIn ? "Update Password" : "Reset Password";

    return (
        <Formik
            initialValues={loggedIn ? { ...initialValues, email: currentUser?.email || "" } : initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {({ handleSubmit, isSubmitting }) => (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Work Email</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg">mail</span>
                            <Field
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-3.5 pl-11 pr-4 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                                disabled={loggedIn}
                            />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-error text-[10px] ml-1 mt-1 font-bold" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">New Password</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg">lock</span>
                            <Field
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-3.5 pl-11 pr-11 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface-variant transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        <ErrorMessage name="password" component="div" className="text-error text-[10px] ml-1 mt-1 font-bold" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Confirm New Password</label>
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-lg">lock_reset</span>
                            <Field
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-surface-container-high/50 border border-outline-variant/20 rounded-xl py-3.5 pl-11 pr-11 text-on-surface placeholder:text-outline-variant/50 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface-variant transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="text-error text-[10px] ml-1 mt-1 font-bold" />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center disabled:opacity-70 mt-6"
                    >
                        {isSubmitting || loading ? (
                            <LoaderSpinner color="white" size={18} />
                        ) : submitText}
                    </button>
                </form>
            )}
        </Formik>
    );
};

export default ResetPasswordForm;

