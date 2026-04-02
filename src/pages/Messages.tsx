import { AppLayout } from "@/components/layout/AppLayout";
import MessagesContainer from "@/components/messaging/MessagesContainer";

const Messages = () => {
  return (
    <AppLayout fullWidth noTransition>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 min-h-[calc(100vh-3.5rem)] md:min-h-screen md:py-4">
        <MessagesContainer />
      </div>
    </AppLayout>
  );
};

export default Messages;
