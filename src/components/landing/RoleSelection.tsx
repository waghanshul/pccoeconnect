
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, ArrowLeft } from "lucide-react";

interface RoleSelectionProps {
  role: "student" | "admin" | null;
  setRole: (role: "student" | "admin") => void;
  setStep: (step: "auth" | "initial") => void;
}

export const RoleSelection = ({ role, setRole, setStep }: RoleSelectionProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 text-gray-400 hover:text-white"
          onClick={() => setStep("initial")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold text-primary">Choose Your Role</h2>
        <p className="text-xl text-muted-foreground">
          Select your role to access personalized features and content
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Button
            size="lg"
            variant={role === "student" ? "default" : "outline"}
            className="w-full h-auto py-8 flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-all duration-300 border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/25 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20"
            onClick={() => {
              setRole("student");
              setStep("auth");
            }}
          >
            <div className="p-4 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors group-hover:shadow-lg">
              <GraduationCap className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Student</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Access study materials and connect with peers
              </p>
            </div>
          </Button>
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700/50">
            <h4 className="font-semibold mb-2 text-muted-foreground">Student Features:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground/80">
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
            className="w-full h-auto py-8 flex flex-col items-center justify-center gap-4 group hover:scale-105 transition-all duration-300 border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/25 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20"
            onClick={() => {
              setRole("admin");
              setStep("auth");
            }}
          >
            <div className="p-4 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-colors group-hover:shadow-lg">
              <Shield className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">Admin</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Manage platform content and oversee activities
              </p>
            </div>
          </Button>
          <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700/50">
            <h4 className="font-semibold mb-2 text-muted-foreground">Admin Features:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground/80">
              <li>• Content moderation</li>
              <li>• User management</li>
              <li>• Analytics dashboard</li>
              <li>• System configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
