import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Features } from "./Features";
import { motion } from "framer-motion";

interface HeroProps {
  setStep: (step: "role") => void;
  resetRole: () => void;
}

export const Hero = ({ setStep, resetRole }: HeroProps) => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between min-h-screen gap-16">
      <div className="w-full lg:w-1/2 space-y-8 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Logo />
        </motion.div>
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Welcome to{" "}
            <span className="text-primary">ChatPCCOE</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-xl"
          >
            Your exclusive social platform to connect, collaborate, and grow with fellow PCCOE students.
          </motion.p>

          <Features />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Button
              size="lg"
              className="mt-8 text-base px-8 py-6 rounded-full"
              onClick={() => {
                resetRole();
                setStep("role");
              }}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full lg:w-1/2 flex justify-center relative z-10"
      >
        <div className="relative w-full max-w-lg">
          <img
            src="/lovable-uploads/632cb8a0-bd7f-4e2a-a647-734d748778ca.png"
            alt="PCCOE Campus - Aerial View"
            className="rounded-2xl shadow-2xl border border-border"
          />
        </div>
      </motion.div>
    </div>
  );
};
