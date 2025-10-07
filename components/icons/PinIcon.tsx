
import React from 'react';
import { motion, SVGMotionProps } from 'framer-motion';

export const PinIcon: React.FC<SVGMotionProps<SVGSVGElement> & { isPinned: boolean }> = ({ isPinned, ...props }) => (
    <motion.svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        animate={{ rotate: isPinned ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        {...props}
    >
        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H20v-2l-2-2h-2z" />
    </motion.svg>
);
