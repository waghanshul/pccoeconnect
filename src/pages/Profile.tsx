import { Navigation } from "@/components/Navigation";
import { UserProfile } from "@/components/UserProfile";

const Profile = () => {
  const user = {
    name: "John Doe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    role: "Student",
    department: "Computer Engineering",
    year: "Third",
    bio: "Passionate about software development and artificial intelligence. Always eager to learn new technologies and collaborate on innovative projects.",
    interests: ["Web Development", "AI/ML", "Competitive Programming", "Open Source"],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <UserProfile user={user} />
      </main>
    </div>
  );
};

export default Profile;