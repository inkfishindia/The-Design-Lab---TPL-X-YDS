import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  const cardClasses = `bg-dark-surface text-text-light border border-dark-border rounded-xl shadow-xl shadow-black/25 p-6 ${className || ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cardClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
};
