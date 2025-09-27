import React from 'react';

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path fillRule="evenodd" d="M11.25 2.25c.414 0 .75.336.75.75v11.59l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-3 15.75a.75.75 0 01.75.75v.008c0 .414.336.75.75.75h3a.75.75 0 010 1.5h-3a2.25 2.25 0 01-2.25-2.25v-.008a.75.75 0 01.75-.75z" clipRule="evenodd" />
    <path d="M10.5 3a1.5 1.5 0 00-1.5 1.5v1.5H6a3 3 0 00-3 3v6a3 3 0 003 3h12a3 3 0 003-3V9a3 3 0 00-3-3h-3V4.5a1.5 1.5 0 00-1.5-1.5h-3zm-1.5 6a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6z" />
  </svg>
);