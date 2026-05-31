import React from "react";
import "./text.field.formik.scss";
import PropTyes from "prop-types";

export const TextFieldFormik = ({
  name,
  id,
  values,
  handleBlur,
  handleChange,
  errors,
  touched,
  disabled,
  placeholder,
  type = "text",
  label,
  labelClassName,
  warpperClassName,
  className = "form-control",
  errorClassName = "formik_error",
  autoComplete = "on",
}) => {
  return (
    <div className={warpperClassName}>
      {label && (
        <label htmlFor={name} className={labelClassName}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={className}
        id={id}
        name={name}
        onChange={handleChange}
        onBlur={handleBlur}
        value={values[name]}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
      />

      {errors[name] && touched[name] && (
        <p className={errorClassName}>
          {errors[name] && touched[name] && errors[name]}
        </p>
      )}
    </div>
  );
};
TextFieldFormik.propTypes = {
  name: PropTyes.string.isRequired,
  id: PropTyes.string,
  values: PropTyes.object,
  onBlur: PropTyes.func,
  error: PropTyes.object,
  touched: PropTyes.object,
  disabled: PropTyes.bool,
  placeholder: PropTyes.string,
  type: PropTyes.string,
  label: PropTyes.string,
  labelClassName: PropTyes.string,
  warpperClassName: PropTyes.string,
  className: PropTyes.string,
  errorClassName: PropTyes.string,
  autoComplete: PropTyes.string,
};
