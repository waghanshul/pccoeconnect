import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, GraduationCap, Shield, Users, BookOpen, Calendar, MessageSquare } from "lucide-react";
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

const Landing = () => {
  const [step, setStep] = useState<"initial" | "role" | "auth">("initial");
  const [role, setRole] = useState<"student" | "admin" | null>(null);

  const features = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Connect with Fellow Students",
      description: "Build meaningful connections within the PCCOE community",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Academic Discussions",
      description: "Engage in enriching academic conversations",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "College Events",
      description: "Stay updated with all campus activities and events",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Resource Sharing",
      description: "Share and access valuable academic resources",
    },
  ];

  if (step === "initial") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-12">
          <div className="w-full lg:w-1/2 space-y-8">
            <Logo />
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  PCCOE Connect
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Your exclusive social platform to connect, collaborate, and grow with fellow PCCOE students.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-8 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => setStep("role")}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg">
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                alt="Students"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {step === "role" && (
          <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold">Choose Your Role</h2>
              <p className="text-xl text-muted-foreground">
                Select your role to access personalized features and content
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Button
                  size="lg"
                  variant={role === "student" ? "default" : "outline"}
                  className="w-full h-48 flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-transform duration-300"
                  onClick={() => {
                    setRole("student");
                    setStep("auth");
                  }}
                >
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-12 w-12" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-semibold">Student</h3>
                    <p className="text-sm text-muted-foreground">
                      Access study materials, connect with peers, and join academic discussions
                    </p>
                  </div>
                </Button>
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-2">Student Features:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Access to academic resources</li>
                    <li>• Connect with classmates</li>
                    <li>• Join study groups</li>
                    <li>• Track academic events</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <Button
                  size="lg"
                  variant={role === "admin" ? "default" : "outline"}
                  className="w-full h-48 flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-transform duration-300"
                  onClick={() => {
                    setRole("admin");
                    setStep("auth");
                  }}
                >
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-12 w-12" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-semibold">Admin</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage platform content and oversee student activities
                    </p>
                  </div>
                </Button>
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-2">Admin Features:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Content moderation</li>
                    <li>• User management</li>
                    <li>• Analytics dashboard</li>
                    <li>• System configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "auth" && (
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold">
                Sign in as {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                Enter your credentials to continue
              </p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-8 rounded-xl shadow-sm">
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
        )}
      </div>
    </div>
  );
};

export default Landing;