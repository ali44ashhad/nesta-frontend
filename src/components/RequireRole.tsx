// components/RequireRole.tsx
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { JSX } from "react";

const RequireRole = ({
  children,
  role
}: {
  children: JSX.Element;
  role: string;
}) => {
  const user = AuthService.getCurrentUser();
  return user && user.roles.includes(role) ? children : <Navigate to="/login" />;
};

export default RequireRole;
