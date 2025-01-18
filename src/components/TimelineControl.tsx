import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface TimelineControlProps {
  startDate: Date;
  endDate: Date;
  position: number;
  onChange: (position: number) => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  startDate,
  endDate,
  position,
  onChange,
}) => {
  const currentDate = new Date(
    startDate.getTime() + (endDate.getTime() - startDate.getTime()) * position
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          {format(startDate, 'MMM d, yyyy')}
        </span>
        <span className="text-sm font-medium">
          {format(currentDate, 'MMM d, yyyy')}
        </span>
        <span className="text-sm text-gray-500">
          {format(endDate, 'MMM d, yyyy')}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={position}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </motion.div>
  );
};