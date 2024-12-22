import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, GraduationCap, Shield } from "lucide-react";

const Landing = () => {
  const [step, setStep] = useState<"initial" | "role" | "auth">("initial");
  const [role, setRole] = useState<"student" | "admin" | null>(null);
  const [credentials, setCredentials] = useState({ prn: "", password: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Welcome to PCCOE Connect!",
      description: "Login successful",
    });
    navigate("/home");
  };

  const features = [
    "Connect with fellow students",
    "Join academic discussions",
    "Stay updated with college events",
    "Share resources and knowledge",
    "Build your academic network",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-8">
        {step === "initial" && (
          <div className="w-full lg:w-1/2 space-y-8 animate-fade-in">
            <Logo />
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Welcome to PCCOE Connect
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A social platform exclusively for PCCOE students to connect,
                collaborate, and grow together.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg shadow-sm"
                  >
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="mt-8"
                onClick={() => setStep("role")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "role" && (
          <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in">
            <h2 className="text-3xl font-semibold text-center">Select Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                size="lg"
                variant={role === "student" ? "default" : "outline"}
                className="h-32 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  setRole("student");
                  setStep("auth");
                }}
              >
                <GraduationCap className="h-8 w-8" />
                <span>Student</span>
              </Button>
              <Button
                size="lg"
                variant={role === "admin" ? "default" : "outline"}
                className="h-32 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  setRole("admin");
                  setStep("auth");
                }}
              >
                <Shield className="h-8 w-8" />
                <span>Admin</span>
              </Button>
            </div>
          </div>
        )}

        {step === "auth" && (
          <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold">
                Sign in as {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-8 rounded-xl shadow-sm">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {role === "student" ? "PRN Number" : "Username"}
                  </label>
                  <Input
                    type="text"
                    placeholder={role === "student" ? "Enter PRN Number" : "Enter Username"}
                    value={credentials.prn}
                    onChange={(e) =>
                      setCredentials({ ...credentials, prn: e.target.value })
                    }
                    required
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
            </div>
          </div>
        )}

        {step === "initial" && (
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
              <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  alt="Students"
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;