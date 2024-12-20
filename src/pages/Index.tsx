import { Navigation } from "@/components/Navigation";
import { Post } from "@/components/Post";

const Index = () => {
  const posts = [
    {
      author: "Arjun Patel",
      content: "Just submitted my final project for Advanced Algorithms! #PCCOE #ComputerScience",
      timestamp: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80",
      authorId: "arjun-patel",
    },
    {
      author: "Priya Sharma",
      content: "Looking for team members for the upcoming hackathon! DM if interested 🚀 #Hackathon #TeamBuilding",
      timestamp: "5 hours ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      authorId: "priya-sharma",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all duration-200 hover:shadow-md">
            <textarea
              placeholder="What's on your mind?"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200"
            />
            <div className="flex justify-end mt-3">
              <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200 transform hover:-translate-y-0.5">
                Post
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {posts.map((post, index) => (
              <Post key={index} {...post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;