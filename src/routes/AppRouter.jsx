import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* redirection page racine */}
        <Route path="/" element={<Navigate to="/francomaliship/auth/login" />} />
        <Route path="/francomaliship" element={<Navigate to="/francomaliship/auth/login" />} />
        <Route path="/francomaliship/auth" element={<Navigate to="/francomaliship/auth/login" />} />


        {/* login */}
        <Route path="/francomaliship/auth/login" element={<Login />} />

        {/* dashboard */}
        <Route
          path="/francomaliship/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
