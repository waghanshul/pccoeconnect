import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface RoleSelectionProps {
  role: "student" | "admin" | null;
  setRole: (role: "student" | "admin" | null) => void;
  setStep: (step: "auth" | "initial") => void;
}

export const RoleSelection = ({ role, setRole, setStep }: RoleSelectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => {
            setRole(null);
            setStep("initial");
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold gradient-text">Choose Your Role</h2>
        <p className="text-lg text-muted-foreground">
          Select your role to access personalized features and content
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            roleKey: "student" as const,
            icon: GraduationCap,
            title: "Student",
            desc: "Access study materials and connect with peers",
            features: ["Access to academic resources", "Connect with classmates", "Join study groups", "Track academic events"],
          },
          {
            roleKey: "admin" as const,
            icon: Shield,
            title: "Admin",
            desc: "Manage platform content and oversee activities",
            features: ["Content moderation", "User management", "Analytics dashboard", "System configuration"],
          },
        ].map((card, i) => (
          <motion.div
            key={card.roleKey}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 300, damping: 25 }}
            className="space-y-6"
          >
            <button
              className="w-full h-auto py-10 flex flex-col items-center justify-center gap-4 group glass-card rounded-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setRole(card.roleKey);
                setStep("auth");
              }}
            >
              <motion.div
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
                className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300"
              >
                <card.icon className="h-12 w-12 text-primary" />
              </motion.div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
              </div>
            </button>
            <div className="glass-surface p-6 rounded-xl">
              <h4 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">{card.title} Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {card.features.map((f, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + j * 0.06 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />{f}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
