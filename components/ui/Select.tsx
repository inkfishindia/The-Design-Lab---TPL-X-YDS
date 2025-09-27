import React from 'react';

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: React.ReactNode;
};

export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  const baseClasses = "block w-full px-4 py-3 bg-white border border-midnight-navy/30 rounded-lg text-sm placeholder-midnight-navy/50 focus:outline-none focus:ring-2 focus:ring-heritage-blue focus:border-heritage-blue transition-colors appearance-none";

  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-midnight-navy/80 mb-1.5">{label}</label>}
      <div className="relative">
        <select id={id} className={baseClasses} {...props}>
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-midnight-navy/60">
            <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
};
