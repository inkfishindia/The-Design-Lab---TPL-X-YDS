import React from 'react';

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 48 48" {...props} xmlns="http://www.w3.org/2000/svg">
    <title>Google Logo</title>
    <clipPath id="g-clip">
        <path d="M44.5 24H24v8.5h11.8C34.7 36.7 30.1 40 24 40a16 16 0 0 1-16-16 16 16 0 0 1 16-16c5.2 0 9.6 2.6 12.4 6.6l6.6-6.6A24 24 0 0 0 24 0 24 24 0 0 0 24 48c13.3 0 24-10.7 24-24 0-1.3-.1-2.7-.4-4z" />
    </clipPath>
    <g clipPath="url(#g-clip)">
        <path fill="#FBBC05" d="M0 37V11l17 13z" />
        <path fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
        <path fill="#34A853" d="M0 37l30-23.5L48 14l-24 19z" />
        <path fill="#4285F4" d="M48 48H12L30 23.5 48 14z" />
    </g>
  </svg>
);
