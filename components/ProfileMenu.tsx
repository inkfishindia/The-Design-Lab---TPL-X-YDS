

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GoogleUser } from '../types';
import { UserIcon } from './icons/UserIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SignOutIcon } from './icons/SignOutIcon';

interface ProfileMenuProps {
  user: GoogleUser | null;
  onSignOut: () => void;
  onNavigateToSettings: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onSignOut, onNavigateToSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isApiKeyMissing = process.env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleSettingsClick = () => {
    onNavigateToSettings();
    setIsOpen(false);
  };
  
  const handleSignOutClick = () => {
    onSignOut();
    setIsOpen(false);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        disabled={isApiKeyMissing && !user}
        title={user ? user.name : (isApiKeyMissing ? "Configure API Key to sign in" : "Account options")}
        className="w-9 h-9 rounded-full bg-dark-surface hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2 focus:ring-offset-dark-bg transition-all"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {user ? (
          <img src={user.picture} alt={user.name} className="w-full h-full rounded-full" />
        ) : (
          <UserIcon className="w-5 h-5 m-auto text-text-light" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 origin-top-right bg-dark-surface rounded-lg shadow-xl shadow-black/30 ring-1 ring-dark-border focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            {user ? (
              <div className="p-2" role="none">
                <div className="px-2 py-2 border-b border-dark-border">
                  <p className="text-sm font-semibold text-text-light truncate" role="none">{user.name}</p>
                  <p className="text-xs text-text-muted truncate" role="none">{user.email}</p>
                </div>
                <div className="pt-2 space-y-1" role="none">
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-muted rounded-md hover:bg-dark-border hover:text-text-light transition-colors"
                    role="menuitem"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleSignOutClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-error-red rounded-md hover:bg-error-red/10 transition-colors"
                    role="menuitem"
                  >
                    <SignOutIcon className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2" role="none">
                <div className="space-y-1" role="none">
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-muted rounded-md hover:bg-dark-border hover:text-text-light transition-colors"
                    role="menuitem"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
