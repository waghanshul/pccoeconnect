import { AppLayout } from "@/components/layout/AppLayout";
import { SocialFeed } from "@/components/social/SocialFeed";

const Index = () => {
  return (
    <AppLayout>
      <div className="py-6">
        <SocialFeed />
      </div>
    </AppLayout>
  );
};

export default Index;
