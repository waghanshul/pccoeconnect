
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Features } from "./Features";

interface HeroProps {
  setStep: (step: "role") => void;
  resetRole: () => void;
}

export const Hero = ({ setStep, resetRole }: HeroProps) => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-16">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-[150px] animate-blob animation-delay-2000" />
      </div>

      <div className="w-full lg:w-1/2 space-y-8 relative z-10">
        <Logo />
        <div className="space-y-6">
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Welcome to{" "}
            <span className="gradient-text">
              PCCOE Connect
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            Your exclusive social platform to connect, collaborate, and grow with fellow PCCOE students.
          </p>
          
          <Features />

          <Button
            size="lg"
            className="mt-8 text-base px-8 py-6 rounded-full glow-primary hover:scale-[1.02] transition-all duration-300"
            onClick={() => {
              resetRole();
              setStep("role");
            }}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex justify-center relative z-10">
        <div className="relative w-full max-w-lg animate-float">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-2xl" />
          <img
            src="/lovable-uploads/632cb8a0-bd7f-4e2a-a647-734d748778ca.png"
            alt="PCCOE Campus - Aerial View"
            className="relative rounded-2xl shadow-2xl border border-white/[0.08]"
          />
        </div>
      </div>
    </div>
  );
};
