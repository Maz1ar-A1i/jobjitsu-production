import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleAuth } from "../../../services/apis/authService";
import { setCurrentUser } from "../../../features/auth/slice/authSlice";
import { useDispatch } from "react-redux";
import { createNotification } from "../../../helpers/createNotifications";

function GoogleLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginSuccess = (user, token) => {
    localStorage.setItem("token", token);
    try {
      localStorage.setItem("currentUser", JSON.stringify({ ...user, token }));
    } catch {}
    dispatch(
      setCurrentUser({
        ...user,
        token,
      })
    );
    createNotification("success", `Welcome ${user.name || user.username}!`);
    navigate(`/dashboard`);
  };

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const res = await googleAuth(authResult.code);
        if (res && res.status === 1) {
          loginSuccess(res.user, res.token);
        } else {
          createNotification("error", res?.errMsg || "Google login failed");
        }
      }
    } catch (error) {
      console.log("Error while google login:", error.message);
      createNotification("error", "Google login failed. Please try again.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <button
      onClick={googleLogin}
      type="button"
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all duration-200 border border-outline-variant/10 group w-full"
    >
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUkYBllEqcQ4EK2n9F5DYhWBsiG2Jnnm_Xcdr8GRp03IeLzDA2enPlvTvqCV5iUBcOajjceSUZMkxfqzCHjomjSZXtYZHYZhVHpaaxlBpoqW_tcNs9ERTQS6cFs97hJ3mI_5Dg5Kr4zB42b7kl-9A9k-Vti0Uq9AQn8TqOtjijuZqza_HCHCfr4O83-LqxW-auHQ4qvPI6UPVjiEwjQe-fo_ro65Ppp4kRiqYXPOaBNxCYUBvulQhvMgyJ1FwO4N5UGopiGvcLR6Wq"
        alt="Google"
        className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
      />
      <span className="text-sm font-medium">Google</span>
    </button>
  );
}

export default GoogleLogin;
