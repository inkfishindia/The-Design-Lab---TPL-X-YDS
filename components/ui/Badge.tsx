import React from 'react';

type BadgeProps = {
  color?: 'blue' | 'orange' | 'green' | 'red' | 'yellow' | 'gray';
  children: React.ReactNode;
};

export const Badge: React.FC<BadgeProps> = ({ color = 'gray', children }) => {
  const colorClasses = {
    blue: 'bg-accent-blue/10 text-accent-blue',
    orange: 'bg-accent-orange/10 text-accent-orange',
    green: 'bg-success-green/10 text-success-green',
    red: 'bg-error-red/10 text-error-red',
    yellow: 'bg-accent-yellow/10 text-accent-yellow',
    gray: 'bg-dark-border/50 text-text-muted',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
};
