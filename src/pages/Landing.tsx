
import { useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { RoleSelection } from "@/components/landing/RoleSelection";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { AdminRegisterForm } from "@/components/auth/AdminRegisterForm";
import { StudentLoginForm } from "@/components/auth/StudentLoginForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Step = "hero" | "role" | "auth";
type Role = "student" | "admin" | null;
type AuthTab = "login" | "register";

export default function Landing() {
  const [step, setStep] = useState<Step>("hero");
  const [role, setRole] = useState<Role>(null);
  const [authTab, setAuthTab] = useState<AuthTab>("login");

  // Reset to home
  const goToHome = () => {
    setStep("hero");
    setRole(null);
  };

  // Go back one step
  const goBack = () => {
    if (step === "auth") {
      setStep("role");
    } else if (step === "role") {
      setStep("hero");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header navigation for back/home when not on hero */}
      {step !== "hero" && (
        <header className="p-4 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack}>
            Back
          </Button>
          <Button variant="ghost" onClick={goToHome}>
            Home
          </Button>
        </header>
      )}

      <main className="container mx-auto px-4 py-8">
        {step === "hero" && <Hero setStep={setStep} />}

        {step === "role" && (
          <RoleSelection role={role} setRole={setRole} setStep={setStep} />
        )}

        {step === "auth" && (
          <div className="max-w-md mx-auto mt-8">
            <Tabs
              defaultValue={authTab}
              onValueChange={(value) => setAuthTab(value as AuthTab)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                {role === "student" ? (
                  <StudentLoginForm googleDisabled={true} />
                ) : (
                  <AdminLoginForm />
                )}
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                {role === "student" ? (
                  <div className="space-y-6">
                    <form className="space-y-4">
                      {/* Student Registration Form */}
                      {/* This will be handled by StudentRegisterForm component */}
                    </form>
                  </div>
                ) : (
                  <AdminRegisterForm />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
