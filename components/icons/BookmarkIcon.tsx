

import React from 'react';

export const BookmarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {children}
    <path
      fillRule="evenodd"
      d="M5 2a2 2 0 00-2 2v16l7-3.5 7 3.5V4a2 2 0 00-2-2H5z"
      clipRule="evenodd"
    />
  </svg>
);