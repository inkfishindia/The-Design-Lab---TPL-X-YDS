
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'onClick'> & {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'danger' | 'creative';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  className?: string;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    children,
    leftIcon,
    className,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-accent-blue text-white hover:bg-accent-blue/90 focus:ring-accent-blue focus:ring-offset-dark-surface',
      secondary: 'bg-dark-border text-text-light hover:bg-dark-border/80 focus:ring-accent-blue focus:ring-offset-dark-surface',
      danger: 'bg-error-red text-white hover:bg-error-red/90 focus:ring-error-red focus:ring-offset-dark-surface',
      creative: 'bg-accent-orange text-white hover:bg-accent-orange/90 focus:ring-accent-orange focus:ring-offset-dark-surface',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
