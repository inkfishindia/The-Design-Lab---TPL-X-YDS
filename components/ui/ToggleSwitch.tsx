import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: () => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange }) => {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <motion.div
        className="w-11 h-6 bg-midnight-navy/20 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-heritage-blue peer-checked:bg-heritage-blue"
        initial={false}
        animate={{ backgroundColor: checked ? '#144A87' : '#0A192F33' }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform"
          initial={false}
          animate={{ x: checked ? '20px' : '0px' }}
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        />
      </motion.div>
    </label>
  );
};
