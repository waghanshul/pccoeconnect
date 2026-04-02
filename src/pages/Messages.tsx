import MessagesLayout from "@/components/messaging/MessagesLayout";
import MessagesContainer from "@/components/messaging/MessagesContainer";
import { PageTransition } from "@/components/ui/PageTransition";

const Messages = () => {
  return (
    <PageTransition>
      <MessagesLayout>
        <MessagesContainer />
      </MessagesLayout>
    </PageTransition>
  );
};

export default Messages;
