import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Auth } from "@supabase/ui";
import { supabase } from "./integrations/supabase/client";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Social from "./pages/Social";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import { AuthContext } from "./context/AuthContext";
import Connections from "./pages/Connections";

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
    <AuthContext.Provider value={{ session }}>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Auth supabaseClient={supabase} appearance={{ theme: Auth.Theme.dark }} />}
          />
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
