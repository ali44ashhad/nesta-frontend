import { Navigate } from "react-router-dom";
import { JSX } from "react";

const RequireAuth = ({
  children,
  isAuthenticated,
}: {
  children: JSX.Element;
  isAuthenticated: boolean;
}) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default RequireAuth;