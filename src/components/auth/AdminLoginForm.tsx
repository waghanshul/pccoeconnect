import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminRegisterForm } from "./AdminRegisterForm";

export const AdminLoginForm = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email.endsWith("@pccoepune.org")) {
      toast.error("Please use your PCCOE email address");
      return;
    }
    
    // Log the login attempt (for development purposes)
    console.log("Admin login attempt with email:", credentials.email);
    
    // Show success message
    toast.success("Welcome to PCCOE Connect!");
    navigate("/admin/dashboard");
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