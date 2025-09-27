import React from 'react';

interface CheckCircleIconProps extends React.SVGProps<SVGSVGElement> {
  completed?: boolean;
}

export const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({ completed, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {completed ? (
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06L11.25 12.44l-1.97-1.97a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.25-4.25z"
        clipRule="evenodd"
      />
    ) : (
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 21a9 9 0 100-18 9 9 0 000 18z"
        clipRule="evenodd"
      />
    )}
  </svg>
);