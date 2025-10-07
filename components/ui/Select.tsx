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
  const baseClasses = "block w-full rounded-lg bg-dark-bg px-4 py-2.5 text-text-light border border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors placeholder-text-muted/50 text-sm appearance-none";

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-text-muted mb-1.5">{label}</label>}
      <div className="relative">
        <select id={id} className={baseClasses} {...props}>
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted/60">
            <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
};
