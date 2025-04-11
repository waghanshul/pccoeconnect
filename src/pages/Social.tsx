
import { Navigation } from "@/components/Navigation";
import { SocialFeed } from "@/components/social/SocialFeed";
import { CreatePost } from "@/components/social/CreatePost";

const Social = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Social</h1>
        <CreatePost />
        <SocialFeed />
      </main>
    </div>
  );
};

export default Social;
