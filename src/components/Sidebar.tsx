import React, { useState, useEffect } from 'react';
import { DiamondLogo } from './icons/DiamondLogo';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';
import { ChevronDoubleRightIcon } from './icons/ChevronDoubleRightIcon';
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
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebarCollapsed');
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    return (
        <aside className={`flex flex-col flex-shrink-0 border-r border-dark-border bg-dark-sidebar transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-56'}`}>
            <div className={`flex items-center gap-3 border-b border-dark-border h-[72px] flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                <DiamondLogo className="w-8 h-8 text-text-light flex-shrink-0" />
                {!isCollapsed && (
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
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-dark-border flex-shrink-0">
                <button
                    onClick={() => setIsCollapsed(prev => !prev)}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className={`w-full flex items-center gap-4 py-3 text-sm font-semibold rounded-lg text-text-muted hover:bg-dark-surface hover:text-text-light transition-colors duration-200 ${
                        isCollapsed ? 'px-3 justify-center' : 'px-4'
                    }`}
                >
                    {isCollapsed 
                        ? <ChevronDoubleRightIcon className="w-6 h-6" />
                        : <><ChevronDoubleLeftIcon className="w-6 h-6 flex-shrink-0" /><span>Collapse</span></>
                    }
                </button>
            </div>
        </aside>
    );
};