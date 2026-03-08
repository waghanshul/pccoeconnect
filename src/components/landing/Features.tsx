import { BookOpen, Calendar, MessageSquare, Users } from "lucide-react";

const features = [
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "Connect with Fellow Students",
    description: "Build meaningful connections within the PCCOE community",
  },
  {
    icon: <BookOpen className="h-5 w-5 text-primary" />,
    title: "Academic Discussions",
    description: "Engage in enriching academic conversations",
  },
  {
    icon: <Calendar className="h-5 w-5 text-primary" />,
    title: "College Events",
    description: "Stay updated with all campus activities and events",
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-primary" />,
    title: "Resource Sharing",
    description: "Share and access valuable academic resources",
  },
];

export const Features = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group glass-card p-5 rounded-xl hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              {feature.icon}
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};
