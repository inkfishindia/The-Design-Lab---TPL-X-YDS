
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactElement; // Accepts a single React element
  content: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef<number | null>(null);

  const handleMouseEnter = () => {
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovered(true);
    }, 300); // 300ms delay before showing
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setIsHovered(false);
  };

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isHovered && content && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute z-20 w-max max-w-sm p-3 text-sm text-text-light bg-dark-surface border border-dark-border rounded-lg shadow-lg left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-normal ${className}`}
            style={{ pointerEvents: 'none' }} // Prevent tooltip from capturing mouse events
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};