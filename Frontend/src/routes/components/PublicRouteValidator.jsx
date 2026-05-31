import PropTypes from "prop-types";

const PublicRouteValidator = ({ children }) => {
  return children;
};

PublicRouteValidator.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicRouteValidator;
