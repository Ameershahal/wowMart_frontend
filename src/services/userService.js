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

/**
 * Save Address API
 */
export const saveAddressService = (addressData) => {
  return api.post("/user/save-address", addressData);
};

/**
 * Get Address API
 */
export const getAddressService = () => {
  return api.get("/user/address");
};

/**
 * Google Login API
 */
export const googleLoginService = (credential) => {
  return api.post("/user/google-login", { credential });
};
