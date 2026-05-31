import { object, string, ref } from "yup";

const passwordSchema = string()
  .min(8, "Password must be at least 8 characters long")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .required("Password is required");

export const loginValidation = object().shape({
  email: string().email("Invalid email").required("Email is required"),
  password: string().required("Password is required"),
});

export const signupValidation = object().shape({
  name: string().min(2, "Name too short").required("Name is required"),
  email: string().email("Invalid email").required("Email is required"),
  password: passwordSchema,
  confirmPassword: string()
    .oneOf([ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export const updatePasswordValidation = object().shape({
  email: string().email("Invalid email").required("Email is required"),
  password: passwordSchema,
  confirmPassword: string()
    .oneOf([ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});
