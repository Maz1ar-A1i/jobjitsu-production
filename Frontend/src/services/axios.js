import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
});
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
});

httpClient.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("persist:root")).token;
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
export default httpClient;
