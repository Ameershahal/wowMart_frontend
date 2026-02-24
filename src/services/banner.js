import axios from "axios";

const BASE_URL = "https://wow-jrau.onrender.com/api"; 

/**
 * Signup API
 */
export const signupService = (payload) => {
  return axios.post(`${BASE_URL}/user/sign-up`, payload);
};

/**
 * Login API
 */
export const loginService = (payload) => {
  return axios.post(`${BASE_URL}/user/login`, payload);
};
