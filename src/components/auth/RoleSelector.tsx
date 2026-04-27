import { motion } from "framer-motion";
import { Users, ShieldCheck, ArrowRight } from "lucide-react";

export type AuthRole = "user" | "superadmin";

interface RoleSelectorProps {
  onSelect: (role: AuthRole) => void;
}

const roles: {
  key: AuthRole;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "user",
    title: "Student / Professor",
    description: "Sign in with your PCCOE email to access ChatPCCOE.",
    Icon: Users,
  },
  {
    key: "superadmin",
    title: "Superadmin",
    description: "Restricted access. For platform administrators only.",
    Icon: ShieldCheck,
  },
];

export const RoleSelector = ({ onSelect }: RoleSelectorProps) => {
  return (
    <div className="grid gap-4">
      {roles.map(({ key, title, description, Icon }, idx) => (
        <motion.button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + idx * 0.08, duration: 0.3 }}
          className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60 hover:bg-card/80"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">{title}</div>
            <div className="text-sm text-muted-foreground">{description}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </motion.button>
      ))}
    </div>
  );
};