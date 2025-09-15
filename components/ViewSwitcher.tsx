import React from 'react';
import type { BriefView } from '../App';

interface ViewSwitcherProps {
  currentView: BriefView;
  onViewChange: (view: BriefView) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const baseClasses = "px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex-grow text-center";
  const activeClasses = "bg-blue-600 text-white shadow";
  const inactiveClasses = "bg-gray-700/50 text-slate-300 hover:bg-gray-600/50";

  const views: { id: BriefView; label: string }[] = [
    { id: 'daily', label: 'Daily Brief' },
    { id: 'weekly', label: 'Weekly Brief' },
    { id: 'monthly', label: 'Monthly Brief' },
    { id: 'yearly', label: 'Yearly Brief' },
  ];

  return (
    <div className="mt-4 flex justify-center animate-fade-in">
      <div className="flex space-x-1 sm:space-x-2 bg-gray-800 p-1 rounded-lg w-full max-w-md">
        {views.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`${baseClasses} ${currentView === id ? activeClasses : inactiveClasses}`}
            aria-pressed={currentView === id}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
