
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Mail } from "lucide-react";

export const StudentLoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleResendVerification = async () => {
    if (resendCooldown || isResending) return;
    setIsResending(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.resend({ type: 'signup', email: credentials.email });
      if (error) {
        toast.error("Failed to resend verification email. Please try again.");
      } else {
        toast.success("Verification email sent! Check your inbox.");
        setResendCooldown(true);
        setTimeout(() => setResendCooldown(false), 60000);
      }
    } catch {
      toast.error("Failed to resend verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error, data } = await signIn(credentials.email, credentials.password);
      if (error) {
        toast.error("Invalid email or password");
        return;
      }
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser && !currentUser.email_confirmed_at) {
        toast.error("Please verify your email before signing in. Check your inbox for a confirmation link.", { duration: 6000 });
        setShowResendButton(true);
        await supabase.auth.signOut();
        return;
      }
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();
        
        if (profileData?.role === 'admin' && authUser.email !== 'anshul.wagh22@pccoepune.org') {
          toast.success("Signed in as Faculty!");
          navigate("/admin/dashboard");
          return;
        }
      }
      
      toast.success("Signed in!");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
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
          className=""
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
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
      {showResendButton && (
        <Button
          type="button"
          variant="link"
          className="w-full gap-2"
          onClick={handleResendVerification}
          disabled={isResending || resendCooldown}
        >
          <Mail className="h-4 w-4" />
          {isResending ? "Resending..." : resendCooldown ? "Email sent — check your inbox" : "Resend verification email"}
        </Button>
      )}
    </form>
  );
};
