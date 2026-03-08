import { motion } from "framer-motion";
import { ReactNode, Children } from "react";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const }
  },
};

export const AnimatedList = ({ children, className, staggerDelay = 0.06 }: AnimatedListProps) => {
  const customContainer = {
    ...container,
    show: {
      ...container.show,
      transition: { staggerChildren: staggerDelay },
    },
  };

  return (
    <motion.div
      variants={customContainer}
      initial="hidden"
      animate="show"
      className={className}
    >
      {Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

export const AnimatedListItem = motion.div;
