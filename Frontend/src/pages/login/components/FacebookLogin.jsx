import { useNavigate } from "react-router-dom";
import { ReactComponent as FacebookSvg } from "../../../assets/svg/facebook.svg";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../../features/auth/slice/authSlice";
import { createNotification } from "../../../helpers/createNotifications";

import FacebookLogin from "@greatsumini/react-facebook-login";
import { facebookAuth } from "../../../services/apis/authService";


const FacebookLoginButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const loginSuccess = (user, token) => {
    localStorage.setItem("token", token);
    // persist user for guards on initial load
    try { localStorage.setItem("currentUser", JSON.stringify({ ...user, token })); } catch {}
    dispatch(
      setCurrentUser({
        ...user,
        token,
      })
    );
    createNotification("success", `Welcome ${user.name || user.username}!`);
    // Try normal navigate first
    navigate(`/dashboard`);
    // Fallback in case navigation is blocked by state timing
    setTimeout(() => {
      if (typeof window !== "undefined" && window.location.pathname !== "/dashboard") {
        window.location.assign("/dashboard");
      }
    }, 50);
  };
  
  const handleFacebookResponse = async (authResult) => {
    try {
      console.log({ authResult })
      if (authResult.accessToken) {
        const res = await facebookAuth(authResult.accessToken);
        if (res && res.status === 1) {
          loginSuccess(res.user, res.token);
        } else {
          createNotification("error", res?.errMsg || "Facebook login failed");
        }
      }
    } catch (error) {
      console.log("Error while facebook login:", error.message);
      createNotification("error", "Facebook login failed. Please try again.");
    }
  };

  return (
    <div>
      <FacebookLogin
        appId="24297334703239748"
        fields="id,name,email,picture"
        callback={handleFacebookResponse}
        onFail={(e) => {
          console.log(e);
          createNotification("error", "Facebook login failed");
        }}
        icon="fa fa-facebook"
        style={{
          backgroundColor: '#4267b2',
          color: '#fff',
          fontSize: '16px',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease',
          width: '100%',
          marginBottom: '1rem',
        }}
      />
    </div>
  );
};

export default FacebookLoginButton;
