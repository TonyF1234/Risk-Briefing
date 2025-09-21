
import React, { useState } from 'react';
import type { Risk } from '../types';

interface RiskCardProps {
  risk: Risk;
  index: number;
}

const LinkIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const formatDate = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;

  // This handles YYYY-MM-DD by setting it to UTC midnight to avoid timezone issues.
  const dateWithTimezoneFix = new Date(dateStr + 'T00:00:00');
  // This is a more lenient parser for other formats.
  const flexibleDate = new Date(dateStr);

  const dateToUse = !isNaN(dateWithTimezoneFix.getTime()) ? dateWithTimezoneFix : flexibleDate;

  if (isNaN(dateToUse.getTime())) {
    // If both parsers failed, the string is not a recognizable date.
    // Return the original string as it might contain useful info like "Q2 2024".
    return dateStr;
  }
  
  return dateToUse.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};


export const RiskCard: React.FC<RiskCardProps> = ({ risk, index }) => {
  const [sourcesVisible, setSourcesVisible] = useState(false);
  const animationDelay = `${index * 100}ms`;
  const formattedDate = formatDate(risk.date);

  return (
    <div
      className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-lg shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10 animate-fade-in"
      style={{ animationDelay }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
            {risk.link ? (
                <a href={risk.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-slate-100">
                    <h2 className="text-xl font-bold">{risk.title}</h2>
                </a>
            ) : (
                <h2 className="text-xl font-bold text-slate-100">{risk.title}</h2>
            )}
        </div>
        {risk.isNew && (
            <span className="ml-3 mt-1 flex-shrink-0 bg-green-500/20 text-green-300 text-xs font-semibold px-2.5 py-0.5 rounded-full animate-fade-in">
                New
            </span>
        )}
      </div>

      {formattedDate && (
        <p className="mt-1 text-xs text-slate-500">{formattedDate}</p>
      )}

      <p className="mt-3 text-slate-400 leading-relaxed">{risk.summary}</p>
      
      {risk.sources && risk.sources.length > 0 && (
        <div className="mt-5">
          <button 
            onClick={() => setSourcesVisible(!sourcesVisible)}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center"
          >
            {sourcesVisible ? 'Hide' : 'Show'} Supplementary Sources
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ml-1 transition-transform ${sourcesVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {sourcesVisible && (
            <div className="mt-3 border-t border-gray-700 pt-3">
              <ul className="space-y-2">
                {risk.sources.map((source) => (
                  <li key={source.uri} className="flex items-start">
                     <LinkIcon className="w-4 h-4 text-slate-500 mr-2 mt-1 flex-shrink-0" />
                     <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 hover:underline text-sm break-all transition-colors"
                     >
                        {source.title}
                     </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
