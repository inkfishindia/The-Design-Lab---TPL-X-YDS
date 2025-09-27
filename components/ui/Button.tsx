import React from 'react';
// FIX: Import HTMLMotionProps to correctly type the component props and resolve conflicts with native event handlers.
import { motion, HTMLMotionProps } from 'framer-motion';

// FIX: Extend HTMLMotionProps<'button'> to ensure compatibility with motion.button props, preventing type conflicts.
type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  // FIX: Destructure motion-specific props to avoid spreading them onto the button element and causing conflicts with hardcoded values.
  whileHover,
  whileTap,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-heritage-blue text-white hover:bg-heritage-blue/90 focus:ring-heritage-blue',
    secondary: 'bg-midnight-navy/10 text-midnight-navy hover:bg-midnight-navy/20 focus:ring-heritage-blue',
    danger: 'bg-error-red text-white hover:bg-error-red/90 focus:ring-error-red',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
      {children}
    </motion.button>
  );
};