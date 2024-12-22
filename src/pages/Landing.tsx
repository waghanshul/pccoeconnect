import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";

const Landing = () => {
  const [step, setStep] = useState<"initial" | "role" | "auth">("initial");
  const [role, setRole] = useState<"student" | "admin" | null>(null);
  const [credentials, setCredentials] = useState({ prn: "", password: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, accept any credentials
    toast({
      title: "Welcome to PCCOE Connect!",
      description: "Login successful",
    });
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen gap-8">
        {step === "initial" && (
          <div className="text-center space-y-8 animate-fade-in">
            <Logo />
            <div className="space-y-4 max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to PCCOE Connect
              </h1>
              <p className="text-xl text-muted-foreground">
                A social platform exclusively for PCCOE students to connect,
                collaborate, and grow together.
              </p>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="animate-bounce"
                  onClick={() => setStep("role")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "role" && (
          <div className="text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl font-semibold">Select Your Role</h2>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant={role === "student" ? "default" : "outline"}
                className="w-32 animate-scale-in"
                onClick={() => {
                  setRole("student");
                  setStep("auth");
                }}
              >
                Student
              </Button>
              <Button
                size="lg"
                variant={role === "admin" ? "default" : "outline"}
                className="w-32 animate-scale-in"
                onClick={() => {
                  setRole("admin");
                  setStep("auth");
                }}
              >
                Admin
              </Button>
            </div>
          </div>
        )}

        {step === "auth" && (
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-semibold">
                Sign in as {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder={role === "student" ? "PRN Number" : "Username"}
                  value={credentials.prn}
                  onChange={(e) =>
                    setCredentials({ ...credentials, prn: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;