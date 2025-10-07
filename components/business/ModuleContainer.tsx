
import React from 'react';

export const ModuleContainer: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <section className="bg-dark-surface rounded-xl border border-dark-border flex flex-col h-full overflow-hidden">
        <h2 className="text-2xl font-bold font-display text-text-light px-6 pt-6 pb-4 text-center flex-shrink-0">{title}</h2>
        <div className="flex-grow p-6 pt-2 overflow-auto">
            {children}
        </div>
    </section>
);
