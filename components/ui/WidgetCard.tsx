import React from 'react';
import { Card } from './Card';

interface WidgetCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ title, icon, children, className }) => {
  return (
    <Card className={`flex flex-col h-full !p-0 ${className || ''}`}>
      <header className="drag-handle flex items-center flex-shrink-0 p-4 border-b border-midnight-navy/10 cursor-move">
        {icon && <div className="mr-3 w-6 h-6 flex items-center justify-center text-midnight-navy/80">{icon}</div>}
        <h3 className="font-semibold text-midnight-navy text-lg">{title}</h3>
      </header>
      <div className="flex-grow flex flex-col overflow-hidden">
        {children}
      </div>
    </Card>
  );
};