
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const StudentLoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the login attempt (for development purposes)
    console.log("Login attempt with email:", credentials.email);
    
    // Show success message
    toast.success("Welcome to PCCOE Connect!");
    navigate("/home");
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">PCCOE Email</label>
        <Input
          type="email"
          placeholder="Enter your college email (e.g., student@pccoepune.org)"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
          pattern="^[a-zA-Z0-9._%+-]+@pccoepune\.org$"
          title="Please enter a valid PCCOE email address (ending with @pccoepune.org)"
          className="bg-white dark:bg-gray-900"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          placeholder="Enter Password"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          required
          className="bg-white dark:bg-gray-900"
        />
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
};
