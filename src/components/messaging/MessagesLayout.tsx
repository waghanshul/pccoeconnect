import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";

interface MessagesLayoutProps {
  children: ReactNode;
}

const MessagesLayout = ({ children }: MessagesLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-16 md:pt-20 pb-24 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MessagesLayout;
