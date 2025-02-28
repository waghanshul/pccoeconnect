
import { useState } from "react";
import { Hero } from "@/components/landing/Hero";
import { RoleSelection } from "@/components/landing/RoleSelection";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { AdminRegisterForm } from "@/components/auth/AdminRegisterForm";
import { StudentLoginForm } from "@/components/auth/StudentLoginForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Step = "hero" | "role" | "auth";
type Role = "student" | "admin" | null;
type AuthTab = "login" | "register";

export default function Landing() {
  const [step, setStep] = useState<Step>("hero");
  const [role, setRole] = useState<Role>(null);
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [sheetOpen, setSheetOpen] = useState(false);

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

  // Handle opening the registration sheet
  const openRegistrationSheet = () => {
    setSheetOpen(true);
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
                <TabsTrigger value="register" onClick={openRegistrationSheet}>Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                {role === "student" ? (
                  <StudentLoginForm googleDisabled={true} />
                ) : (
                  <AdminLoginForm />
                )}
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">
                    Click the button below to create your account
                  </p>
                  <Button 
                    onClick={openRegistrationSheet}
                    className="mx-auto"
                  >
                    Create Account
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Registration Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{role === "student" ? "Create Student Account" : "Create Admin Account"}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {role === "student" ? (
                    <div className="space-y-6">
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                          <input 
                            id="fullName" 
                            type="text" 
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">Email</label>
                          <input 
                            id="email" 
                            type="email" 
                            className="w-full p-2 border rounded-md"
                            placeholder="your.email@example.com"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="studentId" className="text-sm font-medium">Student ID</label>
                          <input 
                            id="studentId" 
                            type="text" 
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter your student ID"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="password" className="text-sm font-medium">Password</label>
                          <input 
                            id="password" 
                            type="password" 
                            className="w-full p-2 border rounded-md"
                            placeholder="Create a secure password"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                          <input 
                            id="confirmPassword" 
                            type="password" 
                            className="w-full p-2 border rounded-md"
                            placeholder="Confirm your password"
                          />
                        </div>
                        
                        <Button type="submit" className="w-full mt-4">
                          Create Student Account
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <AdminRegisterForm />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>
    </div>
  );
}
