import React from 'react';

export const KanbanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path fillRule="evenodd" d="M4.5 3A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h3.75a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 008.25 3H4.5zm6.75 0A1.5 1.5 0 009.75 4.5v15A1.5 1.5 0 0011.25 21h3.75a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0015 3h-3.75zm6.75 0A1.5 1.5 0 0016.5 4.5v15a1.5 1.5 0 001.5 1.5h3.75a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0020.25 3h-3.75z" clipRule="evenodd" />
  </svg>
);
