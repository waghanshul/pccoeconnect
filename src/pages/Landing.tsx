
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#111827] to-gray-900 dark">
      {step === "initial" && <Hero setStep={setStep} resetRole={() => setRole(null)} />}

      {step === "role" && (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <RoleSelection role={role} setRole={setRole} setStep={setStep} />
        </div>
      )}

      {step === "auth" && (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="flex items-center mb-8">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-gray-400 hover:text-white"
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
                Sign in as {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl shadow-sm">
              {role === "student" ? <StudentLoginForm /> : <AdminLoginForm />}
              
              {role === "student" && (
                <div className="mt-4 text-center">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Create an account
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
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
