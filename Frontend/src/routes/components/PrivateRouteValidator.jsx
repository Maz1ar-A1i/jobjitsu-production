import { Navigate } from "react-router-dom";
import { IsLogin, GetCurrentUser } from "../../utils/utilAuth";
import PropTypes from "prop-types";

const PrivateRouteValidator = ({ children }) => {
  const isLogin = IsLogin();
  const currentUser = GetCurrentUser();
  const allowedRoles = ["user", "admin"];
  // Must be logged in and have a user object
  if (!isLogin || !currentUser) {
    return <Navigate to="/" replace />;
  }
  // If a role exists, ensure it's allowed
  if (currentUser.role && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

PrivateRouteValidator.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRouteValidator;
