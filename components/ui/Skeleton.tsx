

import React from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// FIX: Updated component props to accept all standard div attributes, including `style`.
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('bg-midnight-navy/10 animate-pulse rounded-md', className)}
      {...props}
    />
  );
};