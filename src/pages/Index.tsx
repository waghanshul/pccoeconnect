import { Navigation } from "@/components/Navigation";
import { Post } from "@/components/Post";

const Index = () => {
  const posts = [
    {
      author: "John Doe",
      content: "Just submitted my final project for Advanced Algorithms! #PCCOE #ComputerScience",
      timestamp: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      author: "Jane Smith",
      content: "Looking for team members for the upcoming hackathon! DM if interested 🚀",
      timestamp: "5 hours ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <textarea
              placeholder="What's on your mind?"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-end mt-3">
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                Post
              </button>
            </div>
          </div>
          
          {posts.map((post, index) => (
            <Post key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;