import React from 'react';
// FIX: Import HTMLMotionProps to correctly type the component props and resolve conflicts with native event handlers.
import { motion, HTMLMotionProps } from 'framer-motion';

// FIX: Extend HTMLMotionProps<'div'> to ensure compatibility with motion.div props, preventing type conflicts, and ensure children are required.
type CardProps = HTMLMotionProps<'div'> & {
  children: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ children, className, 
  // FIX: Destructure motion-specific props to avoid spreading them onto the div and causing conflicts with hardcoded values.
  initial, animate, transition, ...props }) => {
  const cardClasses = `bg-cream text-midnight-navy border border-cream/10 rounded-lg shadow-xl shadow-black/25 p-6 ${className || ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cardClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
};