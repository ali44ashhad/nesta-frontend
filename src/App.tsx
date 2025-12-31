import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastProvider } from "./components/ToastManager";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Profile from "./components/profile.component";
import AdminBoard from "./components/board-admin.component";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";
import BlocklyLayout from "./layouts/BlocklyLayout";
import LocationRequest from "./components/LocationRequest";
import AuthService from "./services/auth.service";
import { colors } from "./config/colors";

import "./App.css";

function AppRoutes() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await AuthService.checkAuth();
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };
    checkAuth();
  }, [location.key]); // Re-check auth on navigation changes

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.veryDarkGray }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.limeGreen }}
          ></div>
          <p style={{ color: colors.lightGray }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/app" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/app" /> : <Register />}
      />
      <Route
        path="/app"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <BlocklyLayout />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole role="ROLE_ADMIN">
            <AdminBoard />
          </RequireRole>
        }
      />
      <Route
        path="/analytics"
        element={
          <RequireRole role="ROLE_ADMIN">
            <AnalyticsDashboard />
          </RequireRole>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/app" : "/login"} />}
      />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <LocationRequest />
        <AppRoutes />
      </Router>
    </ToastProvider>
  );
}

export default App;