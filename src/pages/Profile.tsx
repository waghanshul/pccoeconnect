import { Navigation } from "@/components/Navigation";
import { UserProfile } from "@/components/UserProfile";
import { HomeSidebar } from "@/components/HomeSidebar";

const Profile = () => {
  const user = {
    name: "Arjun Patel",
    avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80",
    role: "Student",
    department: "Computer Engineering",
    year: "Third",
    bio: "Passionate about software development and artificial intelligence. Always eager to learn new technologies and collaborate on innovative projects.",
    interests: ["Web Development", "AI/ML", "Competitive Programming", "Open Source"],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <HomeSidebar />
      <main className="ml-16 container mx-auto px-4 pt-20">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary to-blue-600 dark:from-primary/80 dark:to-blue-600/80 rounded-b-3xl -z-10" />
          <UserProfile user={user} />
        </div>
      </main>
    </div>
  );
};

export default Profile;