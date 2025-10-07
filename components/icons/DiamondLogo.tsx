import React from 'react';
import { motion, SVGMotionProps } from 'framer-motion';

export const DiamondLogo: React.FC<SVGMotionProps<SVGSVGElement>> = (props) => (
  <motion.svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <motion.path 
      d="M12 2L2 12l10 10 10-10L12 2z" 
      fill="currentColor"
    />
  </motion.svg>
);
