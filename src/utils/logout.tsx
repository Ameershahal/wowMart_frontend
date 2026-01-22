import { useNavigate } from "react-router-dom";

export const logout = () => {
  // Remove token and any other user info
  localStorage.removeItem("token");
  sessionStorage.removeItem("auth-storage");

  // Optionally, remove other related data
  localStorage.removeItem("sessionId");

  // Redirect to login (if using inside a component)
  window.location.href = "/login"; // simple full page redirect
};
