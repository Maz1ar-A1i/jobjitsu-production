import { createNotification } from "../../helpers/createNotifications";
import httpClient from "../httpClient";

export const login = async (data) => {
  try {
    const res = await httpClient.post("/user/login", data);
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

export const register = async (data) => {
  try {
    const res = await httpClient.post("/user/createUser", data);
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

export const forgotPassword = async (data) => {
  try {
    const res = await httpClient.post("/user/forgot-password", data);
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

export const resetPassword = async (data) => {
  try {
   // console.log("lalalalla")
    const res = await httpClient.post("/user/resetpassword", data);
  //  console.log("response",res)
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

/*
export const resetPassword = async (data) => {
  try {
    const res = await api.post("/user/reset_password", data); // use httpClient
    return res.data;
  } catch (error) {
    createNotification("error", error.response?.data?.error || error.message);
    return null;
  }
};

*/
export const googleAuth = async (code) => {
  try {
    const res = await httpClient.post("/user/auth/google", { code });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};

export const facebookAuth = async (accessToken) => {
  try {
    const res = await httpClient.post("/user/auth/facebook", { accessToken });
    return res.data;
  } catch (error) {
    createNotification("error", error.message);
  }
};