
import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

interface MessagesLayoutProps {
  children: ReactNode;
}

const MessagesLayout = ({ children }: MessagesLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MessagesLayout;
