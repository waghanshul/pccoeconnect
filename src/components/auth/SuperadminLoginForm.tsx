import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  SUPERADMIN_PASSWORD,
  SUPERADMIN_SESSION_KEY,
  SUPERADMIN_USERNAME,
} from "@/config/superadmin";

export const SuperadminLoginForm = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Tiny artificial delay so the UI doesn't feel jarring.
    await new Promise((r) => setTimeout(r, 200));

    if (
      credentials.username === SUPERADMIN_USERNAME &&
      credentials.password === SUPERADMIN_PASSWORD
    ) {
      sessionStorage.setItem(SUPERADMIN_SESSION_KEY, "true");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid superadmin credentials");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Username</label>
        <Input
          type="text"
          placeholder="Enter superadmin username"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
          required
          autoComplete="off"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in as Superadmin"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Superadmin accounts cannot be created. Contact the platform owner for access.
      </p>
    </form>
  );
};