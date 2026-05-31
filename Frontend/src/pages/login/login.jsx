import { Fragment, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createNotification } from "../../helpers/createNotifications";
import { setCurrentUser } from "../../features/auth/slice/authSlice";
import LoginForm from "../../features/auth/login.form";
import { login, forgotPassword } from "../../services/apis/authService";
import GoogleLogin from "./components/GoogleLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const loginSuccess = (user, token) => {
    localStorage.setItem("token", token);
    dispatch(
      setCurrentUser({
        ...user,
        token,
      })
    );
    createNotification("success", `Welcome ${user.name}!`);
    navigate(`/dashboard`);
  };

  const handleSubmit = async ({ email, password, remember }) => {
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res) {
        if (remember) {
          localStorage.setItem("rememberUser", email);
        } else {
          localStorage.removeItem("rememberUser");
        }
        loginSuccess(res.user, res.token);
      }
    } catch (err) {
      createNotification("error", err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async ({ email }) => {
    setLoading(true);
    const res = await forgotPassword({ email });
    if (res && res.status === 1) {
      createNotification("success", "Reset link sent to your email");
    }
    setLoading(false);
  };

  return (
    <Fragment>
      <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary/30 font-body">
        {/* Header Navigation */}
        <header className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xl bg-opacity-80 flex justify-between items-center px-8 h-12 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-indigo-100 dark:text-white uppercase font-headline">JobJitsu</span>
            <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-pulse"></div>
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">New here?</span>
            <Link to="/signup" className="text-primary font-bold text-xs uppercase tracking-widest hover:text-indigo-300 transition-all">Create Account</Link>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 bg-mesh relative overflow-hidden">
          {/* Abstract AI Visual Element */}
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-tertiary/10 rounded-full blur-[100px]"></div>

          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Side: Editorial Content */}
            <div className="hidden lg:flex flex-col space-y-6 pr-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 w-fit">
                <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">AI Career Assistant</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.1] font-headline">
                Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">career evolution</span> with AI.
              </h1>
              <p className="text-base text-on-surface-variant max-w-md leading-relaxed font-medium">
                Access your personalized interview coach and career trajectory insights.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 flex-1">
                  <span className="material-symbols-outlined text-primary mb-2">psychology</span>
                  <div className="text-sm font-semibold">AI Prep</div>
                  <div className="text-xs text-on-surface-variant">Real-time simulation</div>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 flex-1">
                  <span className="material-symbols-outlined text-tertiary mb-2">analytics</span>
                  <div className="text-sm font-semibold">Skill Analysis</div>
                  <div className="text-xs text-on-surface-variant">Market-aligned data</div>
                </div>
              </div>
            </div>

            {/* Right Side: Sign-In Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md glass-panel p-8 rounded-[1.5rem] border border-outline-variant/10 shadow-2xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1 font-headline">Sign In</h2>
                  <p className="text-on-surface-variant text-xs font-medium">Welcome back to the future of recruitment.</p>
                </div>

                <div className="space-y-6">
                  {/* Social Logins */}
                  <GoogleOAuthProvider clientId="910723846023-4dso5qvaefgnv1eqcobvhufmu0n11794.apps.googleusercontent.com">
                    <GoogleLogin />
                  </GoogleOAuthProvider>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-outline-variant/10"></div>
                    <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or email</span>
                    <div className="flex-grow border-t border-outline-variant/10"></div>
                  </div>

                  <LoginForm
                    onSubmit={handleSubmit}
                    onForgotPassword={handleResetPassword}
                    loading={loading}
                  />
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-on-surface-variant">
                    Don't have an account?
                    <Link to="/signup" className="text-primary font-bold ml-1 hover:underline">Start free trial</Link>
                  </p>
                </div>
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
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/40">© 2026 JobJitsu. AI Career Orchestration.</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link to="/privacy" className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Privacy Policy</Link>
            <Link to="/terms" className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Terms of Service</Link>
            <Link to="/security" className="px-4 py-2 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm">Security</Link>
          </div>
        </footer>
      </div>
    </Fragment>
  );
};

export default Login;
