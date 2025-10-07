import React from 'react';

export const CollapseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M8.25 3.75A2.25 2.25 0 016 6v2.25a.75.75 0 01-1.5 0V6a3.75 3.75 0 013.75-3.75h2.25a.75.75 0 010 1.5H8.25zM3.75 15.75A2.25 2.25 0 016 18h2.25a.75.75 0 010 1.5H6A3.75 3.75 0 012.25 15.75v-2.25a.75.75 0 011.5 0v2.25zM15.75 21.75a2.25 2.25 0 01-2.25-2.25V17.25a.75.75 0 011.5 0v2.25c0 .414.336.75.75.75h2.25a.75.75 0 010 1.5h-2.25zM18 8.25A2.25 2.25 0 0115.75 6h-2.25a.75.75 0 010-1.5h2.25A3.75 3.75 0 0121.75 8.25v2.25a.75.75 0 01-1.5 0V8.25z"
      clipRule="evenodd"
    />
  </svg>
);
