import React from "react";
import "./select.fromik";
import PropTyes from "prop-types";

export const SelectFormik = (props) => {
  const {
    name,
    id,
    values,
    handleBlur,
    handleChange,
    errors,
    touched,
    disabled,
    label,
    labelClassName,
    warpperClassName,
    className = "form-select",
    options,
    empty = true,
    errorClassName = "formik_error",
    onSelect,
  } = props;
  const onChange = (e) => {
    handleChange(e);
    if (onSelect) {
      manageSelect(e.target.value);
    }
  };
  const manageSelect = (val) => {
    const index = options.findIndex((o) => o.value === val);
    if (index > -1) {
      onSelect(options[index].type);
    } else {
      onSelect("");
    }
  };

  return (
    <div className={warpperClassName}>
      <label className={labelClassName} html-for={name}>
        {label}
      </label>
      <select
        className={className}
        id={id}
        name={name}
        onChange={onChange}
        onBlur={handleBlur}
        value={values[name]}
        disabled={disabled}
      >
        {empty && <option value=""> </option>}

        {options.map((opt, i) => {
          return (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <p className={errorClassName}>
        {errors[name] && touched[name] && errors[name]}
      </p>
    </div>
  );
};

SelectFormik.propTypes = {
  name: PropTyes.string.isRequired,
  id: PropTyes.string,
  values: PropTyes.object,
  onBlur: PropTyes.func,
  error: PropTyes.object,
  touched: PropTyes.object,
  disabled: PropTyes.bool,
  label: PropTyes.string,
  labelClassName: PropTyes.string,
  warpperClassName: PropTyes.string,
  className: PropTyes.string,
  options: PropTyes.array,
  empty: PropTyes.bool | true,
  errorClassName: PropTyes.string,
  onSelect: PropTyes.func,
};
