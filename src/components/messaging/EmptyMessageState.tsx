import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const EmptyMessageState = () => {
  return (
    <div className="h-[calc(100vh-8rem)] glass-card rounded-xl flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4 text-center px-8"
      >
        <div className="p-4 rounded-2xl bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-lg mb-1">No conversation selected</h3>
          <p className="text-muted-foreground text-sm">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmptyMessageState;
