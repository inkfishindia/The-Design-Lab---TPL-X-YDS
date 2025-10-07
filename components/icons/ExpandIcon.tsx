import React from 'react';

export const ExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M15 3.75A2.25 2.25 0 0117.25 6v2.25a.75.75 0 01-1.5 0V6a.75.75 0 00-.75-.75H12.75a.75.75 0 010-1.5H15zM4.5 15A2.25 2.25 0 016.75 12.75h2.25a.75.75 0 010 1.5H6.75A.75.75 0 006 15v2.25a.75.75 0 01-1.5 0V15zM19.5 8.25a.75.75 0 01.75-.75h2.25A2.25 2.25 0 0124 9.75v2.25a.75.75 0 01-1.5 0V9.75a.75.75 0 00-.75-.75H19.5a.75.75 0 01-.75-.75zM8.25 19.5a.75.75 0 01-.75.75H5.25A2.25 2.25 0 013 18V15.75a.75.75 0 011.5 0V18a.75.75 0 00.75.75h2.25a.75.75 0 01.75.75z"
      clipRule="evenodd"
    />
  </svg>
);
