import PropTypes from "prop-types";

const LoaderSpinner = ({ className, role, color, size = 16, ...otherProps }) => {
  return (
    <div
      className={className}
      style={{
        fontSize: size / 2,
        color: color,
        width: size + "px",
        height: size + "px",
      }}
      {...otherProps}
    ></div>
  );
};

LoaderSpinner.propTypes = {
  className: PropTypes.string,
  role: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.number,
};

export default LoaderSpinner;
