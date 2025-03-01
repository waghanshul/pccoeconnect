import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const StudentLoginForm = () => {
  const [credentials, setCredentials] = useState({ prn: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the login attempt (for development purposes)
    console.log("Login attempt with PRN:", credentials.prn);
    
    // Show success message
    toast.success("Welcome to PCCOE Connect!");
    navigate("/home");
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">PRN Number</label>
        <Input
          type="text"
          placeholder="Enter PRN Number (e.g., 122B1D066)"
          value={credentials.prn}
          onChange={(e) =>
            setCredentials({ ...credentials, prn: e.target.value })
          }
          required
          pattern="^\d{3}[A-Za-z]\d[A-Za-z]\d{3}$"
          title="PRN must be in the format '122B1D066' (3 digits, letter, digit, letter, 3 digits)"
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