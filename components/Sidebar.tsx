

import React, { useState, useEffect } from 'react';
import { DiamondLogo } from './icons/DiamondLogo';
import { PinIcon } from './icons/PinIcon';
import type { NavItem } from '../types';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: any) => void;
    navItems: NavItem[];
}

const NavButton: React.FC<{
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
}> = ({ item, isActive, onClick, isCollapsed }) => (
    <li>
        <button
            onClick={onClick}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center gap-4 py-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                isCollapsed ? 'px-3 justify-center' : 'px-4'
            } ${
                isActive
                ? 'bg-dark-surface text-accent-blue'
                : 'text-text-muted hover:bg-dark-surface hover:text-text-light'
            }`}
        >
            {React.cloneElement(item.icon, { className: 'w-6 h-6 flex-shrink-0' })}
            {!isCollapsed && (
                <span className="whitespace-nowrap transition-opacity duration-200">{item.label}</span>
            )}
        </button>
    </li>
);


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, navItems }) => {
    // isAutoCollapseEnabled: true means the sidebar is in auto-collapse mode (hover to expand).
    // false means it is pinned open.
    const [isAutoCollapseEnabled, setIsAutoCollapseEnabled] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebarCollapsed');
            // Default to auto-collapse mode (true) for the new behavior.
            return saved ? JSON.parse(saved) : true;
        } catch {
            return true;
        }
    });

    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isAutoCollapseEnabled));
    }, [isAutoCollapseEnabled]);
    
    // The sidebar should be expanded if it's pinned open, or if it's in auto-collapse mode and hovered.
    const shouldBeExpanded = !isAutoCollapseEnabled || isHovered;
    
    // The visual state of being collapsed.
    const isEffectivelyCollapsed = !shouldBeExpanded;

    return (
        <aside 
            className={`sticky top-0 h-screen flex flex-col flex-shrink-0 border-r border-dark-border bg-dark-sidebar transition-all duration-300 ease-in-out z-40 ${isEffectivelyCollapsed ? 'w-20' : 'w-56'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex items-center gap-3 border-b border-dark-border h-[72px] flex-shrink-0 transition-all duration-300 ${isEffectivelyCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                <DiamondLogo className="w-8 h-8 text-text-light flex-shrink-0" />
                {!isEffectivelyCollapsed && (
                    <h1 className="text-xl font-bold text-text-light whitespace-nowrap overflow-hidden">Your Design Lab</h1>
                )}
            </div>
            <nav className="flex-grow p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <NavButton
                            key={item.viewName}
                            item={item}
                            isActive={activeView === item.viewName}
                            onClick={() => setActiveView(item.viewName)}
                            isCollapsed={isEffectivelyCollapsed}
                        />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-dark-border flex-shrink-0">
                <button
                    onClick={() => setIsAutoCollapseEnabled(prev => !prev)}
                    title={isAutoCollapseEnabled ? "Pin sidebar open" : "Enable auto-collapse"}
                    className={`w-full flex items-center gap-4 py-3 text-sm font-semibold rounded-lg text-text-muted hover:bg-dark-surface hover:text-text-light transition-colors duration-200 ${
                        isEffectivelyCollapsed ? 'px-3 justify-center' : 'px-4'
                    }`}
                >
                    <PinIcon isPinned={!isAutoCollapseEnabled} className="w-6 h-6 flex-shrink-0" />
                    {!isEffectivelyCollapsed && <span>{isAutoCollapseEnabled ? 'Pin Sidebar' : 'Unpin'}</span>}
                </button>
            </div>
        </aside>
    );
};