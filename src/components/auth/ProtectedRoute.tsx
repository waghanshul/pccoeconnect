
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, userRole } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // Check user role if a specific role is required
  if (requiredRole && userRole !== requiredRole) {
    // If user is authenticated but doesn't have the required role
    if (requiredRole === 'admin') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};
