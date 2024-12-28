import { Navigation } from "@/components/Navigation";
import { UserProfile as UserProfileComponent } from "@/components/UserProfile";
import { useParams } from "react-router-dom";
import { mockUsers, mockFriends } from "@/data/mockData";

const UserProfile = () => {
  const { userId } = useParams();
  const allUsers = [...mockUsers, ...mockFriends];
  const user = allUsers.find(u => u.id.toString() === userId);

  const userData = user ? {
    name: user.name,
    avatar: user.avatar,
    role: "Student",
    department: user.department || "Computer Engineering",
    year: "Third",
    bio: "Passionate about technology and innovation. Always eager to learn and collaborate on new projects.",
    interests: ["Web Development", "AI/ML", "Competitive Programming"],
    isPublic: true,
    email: `${user.name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: "",
    availability: 'available' as const
  } : null;

  if (!userData) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary to-blue-600 dark:from-primary/80 dark:to-blue-600/80 rounded-b-3xl -z-10" />
          <UserProfileComponent user={userData} />
        </div>
      </main>
    </div>
  );
};

export default UserProfile;