import React from 'react';
import { DragControls } from 'framer-motion';
import { DragHandleIcon } from '../icons/DragHandleIcon';
import { ExpandIcon } from '../icons/ExpandIcon';
import { CollapseIcon } from '../icons/CollapseIcon';

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dragControls?: DragControls;
  headerControls?: React.ReactNode;
  onExpand?: () => void;
  onCollapse?: () => void;
  isFocused?: boolean;
  titleBadge?: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ title, icon, children, className, dragControls, headerControls, onExpand, onCollapse, isFocused, titleBadge }) => {
  return (
    <div className={`bg-dark-surface rounded-lg shadow-xl shadow-black/25 flex flex-col h-full overflow-hidden ${className}`}>
      <header 
        className="flex-shrink-0 flex items-center justify-between p-4 border-b border-dark-border bg-dark-surface/80"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent-blue">{icon}</span>
          <h3 className="font-semibold text-text-light">{title}</h3>
          {titleBadge}
        </div>
        <div className="flex items-center gap-2">
          {headerControls}
          
          {isFocused && onCollapse ? (
             <button onClick={onCollapse} className="p-1.5 text-text-muted hover:text-text-light rounded-md hover:bg-dark-border transition-colors" title="Collapse">
                <CollapseIcon className="w-4 h-4" />
             </button>
          ) : onExpand ? (
            <button onClick={onExpand} className="p-1.5 text-text-muted hover:text-text-light rounded-md hover:bg-dark-border transition-colors" title="Expand">
                <ExpandIcon className="w-4 h-4" />
            </button>
          ) : null}

          {dragControls && (
            <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing text-text-muted/40 hover:text-text-muted p-1 -mr-1"
            title="Drag to reorder"
            >
                <DragHandleIcon className="w-5 h-5" />
            </div>
        )}
        </div>
      </header>
      <div className="flex-grow overflow-auto relative">
        {React.cloneElement(children as React.ReactElement, { key: isFocused ? 'focused' : 'default' })}
      </div>
    </div>
  );
};
