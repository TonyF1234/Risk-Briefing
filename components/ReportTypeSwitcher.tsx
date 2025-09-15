import React from 'react';
import type { ReportType } from '../App';

interface ReportTypeSwitcherProps {
  currentReportType: ReportType;
  onReportTypeChange: (reportType: ReportType) => void;
}

export const ReportTypeSwitcher: React.FC<ReportTypeSwitcherProps> = ({ currentReportType, onReportTypeChange }) => {
  const baseClasses = "px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 flex-1 text-center";
  const activeClasses = "bg-gray-700 text-white";
  const inactiveClasses = "bg-transparent text-slate-400 hover:bg-gray-800";

  const reportTypes: { id: ReportType; label: string }[] = [
    { id: 'briefs', label: 'Risk Briefs' },
    { id: 'fraud', label: 'Fraud Events' },
    { id: 'cyber', label: 'Cyber Incidents' },
  ];

  return (
    <div className="mt-8 flex justify-center animate-fade-in">
      <div className="flex space-x-2 border border-gray-700 p-1 rounded-xl w-full max-w-lg">
        {reportTypes.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onReportTypeChange(id)}
            className={`${baseClasses} ${currentReportType === id ? activeClasses : inactiveClasses}`}
            aria-pressed={currentReportType === id}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};