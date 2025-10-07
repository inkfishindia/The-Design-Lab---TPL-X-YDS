
import React from 'react';

export const CampaignIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM14 14h-4v- organizações-2h4v2zm0-4h-4V8h4v2z" />
     <path d="M20,8.69V4h-4.69L12,0.69L8.69,4H4v4.69L0.69,12L4,15.31V20h4.69L12,23.31L15.31,20H20v-4.69L23.31,12L20,8.69z M12,18 c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S15.31,18,12,18z" fill="currentColor"/>
  </svg>
);