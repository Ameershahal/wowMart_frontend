import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface UnprotectedRouteProps {
  children: ReactNode;
}

const UnprotectedRoute = ({ children }: UnprotectedRouteProps) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default UnprotectedRoute;
