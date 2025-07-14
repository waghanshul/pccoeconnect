
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminRegisterForm } from "./AdminRegisterForm";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validatePCCOEEmail, checkRateLimit, logSecurityEvent } from "@/services/security";

export const AdminLoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn, userRole } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Rate limiting check
      if (!checkRateLimit(`admin_login_${credentials.email}`, 3, 15 * 60 * 1000)) {
        toast.error("Too many login attempts. Please try again in 15 minutes.");
        return;
      }

      // Enhanced validation
      if (!validatePCCOEEmail(credentials.email)) {
        toast.error("Please use your PCCOE email address");
        await logSecurityEvent('invalid_email_attempt', { email: credentials.email });
        return;
      }
      
      if (credentials.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      
      // Authenticate with Supabase
      const { error } = await signIn(credentials.email, credentials.password);
      
      if (error) {
        toast.error("Invalid email or password");
        await logSecurityEvent('failed_admin_login', { 
          email: credentials.email, 
          error: error.message 
        });
        return;
      }
      
      // Log successful admin login
      await logSecurityEvent('admin_login_success', { email: credentials.email });
      
      toast.success("Signed in successfully!");
      navigate("/admin/dashboard");
      
    } catch (error) {
      console.error("Admin login error:", error);
      await logSecurityEvent('admin_login_error', { 
        email: credentials.email, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="Enter PCCOE Email"
          value={credentials.email}
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
          required
          pattern=".*@pccoepune\.org$"
          title="Please use your PCCOE email address (@pccoepune.org)"
          className="bg-white dark:bg-gray-900"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
            className="bg-white dark:bg-gray-900 pr-10"
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
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      
      <div className="mt-4 text-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              Create Admin Account
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create Admin Account</SheetTitle>
              <SheetDescription>
                Fill in your details to register as an admin for PCCOE Connect
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <AdminRegisterForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </form>
  );
};
