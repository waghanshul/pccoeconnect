import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Features } from "./Features";

interface HeroProps {
  setStep: (step: "role") => void;
}

export const Hero = ({ setStep }: HeroProps) => {
  return (
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
          
          <Features />

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
  );
};