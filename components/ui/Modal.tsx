import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloseIcon } from '../icons/CloseIcon';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const backdropVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };

    const modalVariants = {
        hidden: { y: "-50px", opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: "50px", opacity: 0 },
    };
    
    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
    };

    return (
        <AnimatePresence>
        {isOpen && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                aria-labelledby="modal-title"
                role="dialog"
                aria-modal="true"
            >
                <motion.div
                    className="fixed inset-0 bg-black/60"
                    aria-hidden="true"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={backdropVariants}
                    transition={{ duration: 0.3 }}
                    onClick={onClose}
                />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={modalVariants}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.4 }}
                    className={`relative w-full ${sizeClasses[size]}`}
                >
                    <Card>
                        <div className="flex items-start justify-between pb-4 border-b border-midnight-navy/10">
                            <h2 id="modal-title" className="text-xl font-semibold text-midnight-navy">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full text-midnight-navy/60 hover:bg-midnight-navy/10 hover:text-midnight-navy transition-colors"
                                aria-label="Close modal"
                            >
                                <CloseIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="mt-4">
                            {children}
                        </div>
                    </Card>
                </motion.div>
            </div>
        )}
        </AnimatePresence>
    );
};