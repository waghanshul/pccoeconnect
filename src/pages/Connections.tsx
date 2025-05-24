
import { Navigation } from "@/components/Navigation";
import { ConnectionsList } from "@/components/connections/ConnectionsList";

const Connections = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">Connections</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Connect with other students and message them directly</p>
        </div>
        <ConnectionsList />
      </main>
    </div>
  );
};

export default Connections;
