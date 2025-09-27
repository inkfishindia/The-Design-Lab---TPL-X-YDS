import React from 'react';

export const TasksIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
    <path d="M16.5 10.5L11 16l-3.5-3.5 1.41-1.41L11 13.17l4.09-4.08L16.5 10.5z" fill="white"/>
    <path d="M19.5 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="#FBBC05"/>
  </svg>
);
