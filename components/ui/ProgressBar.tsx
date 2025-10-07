

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const cappedProgress = Math.max(0, Math.min(100, progress));

  const getColor = (p: number) => {
    if (p < 40) return 'bg-error-red';
    if (p < 80) return 'bg-warning-yellow';
    return 'bg-success-green';
  };

  return (
    <div className="w-full bg-midnight-navy/20 rounded-full h-2.5">
      <div
        className={`${getColor(cappedProgress)} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${cappedProgress}%` }}
      ></div>
    </div>
  );
};
