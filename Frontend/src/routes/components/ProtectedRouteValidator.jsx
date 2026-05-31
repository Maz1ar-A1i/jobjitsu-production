import { Navigate } from "react-router-dom";
import { IsLogin, GetCurrentUser } from "../../utils/utilAuth";
import PropTypes from "prop-types";

const ProtectedRouteValidator = ({ children, allowedRoles }) => {
  const isLogin = IsLogin();
  const currentUser = GetCurrentUser();

  // ✅ If user is not logged in → redirect to login
  if (!isLogin || !currentUser) {
    return <Navigate to="/" replace />;
  }

  // ✅ If allowedRoles are passed, check role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // ✅ Otherwise allow access
  return children;
};

ProtectedRouteValidator.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string), // optional
};

ProtectedRouteValidator.defaultProps = {
  allowedRoles: [], // default → any logged-in user can access
};

export default ProtectedRouteValidator;
