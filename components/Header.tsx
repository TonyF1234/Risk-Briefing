import React from 'react';
import type { BriefView, ReportType } from '../App';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  reportType: ReportType;
  briefView: BriefView;
}

const RefreshIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4a12 12 0 0116 16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 20a12 12 0 01-16-16" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, reportType, briefView }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentYear = new Date().getFullYear();

  const getSubTitle = () => {
    if (reportType === 'fraud') {
      return `AI-Generated Overview of Notable US Fraud Events for ${currentYear}`;
    }
    if (reportType === 'cyber') {
      return `AI-Generated Overview of Notable Cybersecurity Incidents for ${currentYear}`;
    }

    const subTitleMap: Record<BriefView, string> = {
      daily: `AI-Generated Daily Intelligence Overview for ${today}`,
      weekly: 'AI-Generated Strategic Overview for the Past Week',
      monthly: 'AI-Generated Strategic Overview for the Past Month',
      yearly: `AI-Generated Strategic Overview for ${currentYear}`,
    };
    return subTitleMap[briefView];
  };

  const subTitle = getSubTitle();

  return (
    <header className="border-b border-gray-700 pb-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">
            Global Executive Risk Briefing
          </h1>
          <p className="mt-2 text-slate-400">
            {subTitle}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-full text-slate-400 hover:bg-gray-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-4 mt-1"
          aria-label="Refresh Briefing"
        >
          <RefreshIcon className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`}/>
        </button>
      </div>
    </header>
  );
};