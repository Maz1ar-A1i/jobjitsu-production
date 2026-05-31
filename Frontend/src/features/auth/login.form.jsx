import { useState } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import Loader from "../../components/common/loader/loader.spinner";
import { toast } from "react-toastify";
import { loginValidation as schema } from "./utils/validation";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const LoginForm = (props) => {
  const { loading = false } = props;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: localStorage.getItem("rememberUser") || "",
    password: "",
    remember: !!localStorage.getItem("rememberUser"),
  };

  const onSubmit = (values) => {
    toast.dismiss();
    props.onSubmit(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, values, isSubmitting, isValid }) => (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">
              Work Email
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                alternate_email
              </span>
              <Field
                name="email"
                id="email"
                type="email"
                disabled={loading}
                placeholder="name@company.com"
                className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-slate-600 focus:ring-0 transition-all border-b-2 border-transparent focus:border-secondary"
              />
            </div>
            <ErrorMessage name="email" component="p" className="text-xs text-error mt-1 ml-1" />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-end ml-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate(`/forgot-password`)}
                className="text-xs font-semibold text-secondary hover:text-secondary-fixed transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                lock
              </span>
              <Field
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={loading}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-slate-600 focus:ring-0 transition-all border-b-2 border-transparent focus:border-secondary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <ErrorMessage name="password" component="p" className="text-xs text-error mt-1 ml-1" />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3 ml-1">
            <div className="relative flex items-center">
              <Field
                name="remember"
                className="w-5 h-5 rounded bg-surface-container-low border-outline-variant/30 text-primary-container focus:ring-offset-background focus:ring-primary-container cursor-pointer"
                id="remember"
                type="checkbox"
              />
            </div>
            <label className="text-sm text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
              Remember this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-primary to-primary-container py-4 rounded-xl font-bold text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center"
          >
            {loading ? <Loader size={20} color="white" /> : "Sign In"}
          </button>
        </form>
      )}
    </Formik>
  );
};

LoginForm.propTypes = {
  onForgotPassword: PropTypes.func,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
};

export default LoginForm;
