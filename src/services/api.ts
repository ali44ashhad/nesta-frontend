import axios from "axios";
import AuthService from "./auth.service";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true, // This is crucial for sending cookies with requests
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is an auth error
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/api/auth/signin") || url.includes("/api/auth/signup") || url === "/api/auth/check";
    
    if (
      error.response &&
      [401, 403].includes(error.response.status) &&
      !isAuthEndpoint // Don't redirect for login/register attempts or auth check
    ) {
      console.error("Authentication error. Redirecting to login.");
      AuthService.logout(); // Use the logout method to clear state and cookie
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;