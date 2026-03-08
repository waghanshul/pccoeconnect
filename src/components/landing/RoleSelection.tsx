
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, ArrowLeft } from "lucide-react";

interface RoleSelectionProps {
  role: "student" | "admin" | null;
  setRole: (role: "student" | "admin" | null) => void;
  setStep: (step: "auth" | "initial") => void;
}

export const RoleSelection = ({ role, setRole, setStep }: RoleSelectionProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
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
        <div className="space-y-6">
          <button
            className="w-full h-auto py-10 flex flex-col items-center justify-center gap-4 group glass-card rounded-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => {
              setRole("student");
              setStep("auth");
            }}
          >
            <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Student</h3>
              <p className="text-sm text-muted-foreground">
                Access study materials and connect with peers
              </p>
            </div>
          </button>
          <div className="glass-surface p-6 rounded-xl">
            <h4 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">Student Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Access to academic resources</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Connect with classmates</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Join study groups</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Track academic events</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <button
            className="w-full h-auto py-10 flex flex-col items-center justify-center gap-4 group glass-card rounded-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => {
              setRole("admin");
              setStep("auth");
            }}
          >
            <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Admin</h3>
              <p className="text-sm text-muted-foreground">
                Manage platform content and oversee activities
              </p>
            </div>
          </button>
          <div className="glass-surface p-6 rounded-xl">
            <h4 className="font-semibold mb-3 text-muted-foreground text-sm uppercase tracking-wide">Admin Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Content moderation</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />User management</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Analytics dashboard</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />System configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
