import api from "./api";

/**
 * Signup API
 */
export const signupService = (payload) => {
  return api.post("/user/sign-up", payload);
};

/**
 * Login API
 */
export const loginService = (payload) => {
  return api.post("/user/login", payload);
};

/**
 * Forgot Password API
 */
export const forgotPasswordService = (email) => {
  return api.post("/user/forgot-password", { email });
};
