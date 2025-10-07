import React from 'react';

export const SystemMapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="4" r="2" />
    <circle cx="18" cy="9" r="2" />
    <circle cx="18" cy="15" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="6" cy="15" r="2" />
    <circle cx="6" cy="9" r="2" />
    <path d="M12 6v12" />
    <path d="m16.5 10.5-9 3" />
    <path d="m7.5 10.5 9 3" />
  </svg>
);