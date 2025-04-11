
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { supabase } from "./integrations/supabase/client";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Social from "./pages/Social";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Connections from "./pages/Connections";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  const routes = [
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/user/:id",
      element: (
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/social",
      element: (
        <ProtectedRoute>
          <Social />
        </ProtectedRoute>
      ),
    },
    {
      path: "/notifications",
      element: (
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      ),
    },
    {
      path: "/messages",
      element: (
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      ),
    },
    {
      path: "/messages/:conversationId",
      element: (
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      ),
    },
    {
      path: "/connections",
      element: (
        <ProtectedRoute>
          <Connections />
        </ProtectedRoute>
      ),
    },
  ];

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ session }}>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <div className="flex items-center justify-center min-h-screen bg-gray-900">
                  <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Campus Connect</h1>
                    <div className="space-y-4">
                      <button
                        className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-md transition-colors"
                        onClick={() => window.location.href = '/'}
                      >
                        Continue to App
                      </button>
                    </div>
                  </div>
                </div>
              }
            />
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
};

export default App;
