
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RegisterForm } from "@/components/RegisterForm";
import { StudentLoginForm } from "@/components/auth/StudentLoginForm";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/landing/Hero";
import { RoleSelection } from "@/components/landing/RoleSelection";
import { ArrowLeft } from "lucide-react";

const Landing = () => {
  const [step, setStep] = useState<"initial" | "role" | "auth">("initial");
  const [role, setRole] = useState<"student" | "admin" | null>(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden dark">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {step === "initial" && <Hero setStep={setStep} resetRole={() => setRole(null)} />}

      {step === "role" && (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen relative z-10">
          <RoleSelection role={role} setRole={setRole} setStep={setStep} />
        </div>
      )}

      {step === "auth" && (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen relative z-10">
          <div className="w-full max-w-md mx-auto space-y-8 animate-fadeIn">
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setRole(null);
                  setStep("role");
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold">
                Sign in as <span className="gradient-text">{role?.charAt(0).toUpperCase() + role?.slice(1)}</span>
              </h2>
              <p className="text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>
            <div className="glass-card p-8 rounded-xl">
              {role === "student" ? <StudentLoginForm /> : <AdminLoginForm />}
              
              {role === "student" && (
                <div className="mt-4 text-center">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Create an account
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto bg-background/95 backdrop-blur-xl border-white/[0.08]">
                      <SheetHeader>
                        <SheetTitle>Create your account</SheetTitle>
                        <SheetDescription>
                          Fill in your details to register for PCCOE Connect
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <RegisterForm />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
