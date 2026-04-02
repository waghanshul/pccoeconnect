import { ReactNode } from "react";

interface MessagesLayoutProps {
  children: ReactNode;
}

const MessagesLayout = ({ children }: MessagesLayoutProps) => {
  return <>{children}</>;
};

export default MessagesLayout;
