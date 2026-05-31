import React from "react";
import "./text-field.html.scss";
import PropTyes from "prop-types";
const FormInput = ({ handleChange, label, ...otherProps }) => (
  <div className="group">
    <input className="form-input" onChange={handleChange} {...otherProps} />
    {label ? (
      <label
        className={` ${otherProps.value.length ? "shrink" : ""
          } form-input-label`}
      >
        {" "}
        {label}{" "}
      </label>
    ) : null}
  </div>
);

FormInput.propTypes = {
  handleChange: PropTyes.func.isRequired,
  label: PropTyes.string,
};
export default FormInput;
