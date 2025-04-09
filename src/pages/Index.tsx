
import { Navigation } from "@/components/Navigation";
import { SocialFeed } from "@/components/social/SocialFeed";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  
  // Function to handle any potential script injections
  useEffect(() => {
    // Find and remove the badge if it exists
    const removeEditButton = () => {
      const badgeElements = document.querySelectorAll('.lovable-editor-button, [id*="lovable"], [class*="lovable"]');
      badgeElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
        }
      });
    };

    // Run initially and set up periodic check
    removeEditButton();
    const interval = setInterval(removeEditButton, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-10 max-w-3xl">
        <SocialFeed />
      </main>
      {/* Additional layer to block the badge */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '200px',
          height: '50px',
          backgroundColor: 'transparent',
          zIndex: 999999
        }}
      />
    </div>
  );
};

export default Index;
