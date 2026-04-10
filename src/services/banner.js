import axios from "axios";
import { getApiBaseUrl } from "../utils/apiOrigin.js";

const BASE_URL = getApiBaseUrl();

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
