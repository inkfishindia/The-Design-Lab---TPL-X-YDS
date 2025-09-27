import React from 'react';

type BadgeProps = {
  color?: 'blue' | 'orange' | 'green' | 'red' | 'yellow' | 'gray';
  children: React.ReactNode;
};

export const Badge: React.FC<BadgeProps> = ({ color = 'gray', children }) => {
  const colorClasses = {
    blue: 'bg-heritage-blue/10 text-heritage-blue',
    orange: 'bg-creativity-orange/10 text-creativity-orange',
    green: 'bg-success-green/10 text-success-green',
    red: 'bg-error-red/10 text-error-red',
    yellow: 'bg-warning-yellow/10 text-warning-yellow',
    gray: 'bg-midnight-navy/10 text-midnight-navy/80',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {children}
    </span>
  );
};
