import { BookOpen, Calendar, MessageSquare, Users } from "lucide-react";

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

export const Features = () => {
  return (
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
  );
};