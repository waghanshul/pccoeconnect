import { BookOpen, Calendar, MessageSquare, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Connect with Fellow Students",
    description: "Build meaningful connections within the PCCOE community",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: "Academic Discussions",
    description: "Engage in enriching academic conversations",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "College Events",
    description: "Stay updated with all campus activities and events",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Resource Sharing",
    description: "Share and access valuable academic resources",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export const Features = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + index * 0.1, duration: 0.35 }}
          className="group glass-card p-5 rounded-xl hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${feature.bg} rounded-lg group-hover:scale-110 transition-transform ${feature.color}`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
};
