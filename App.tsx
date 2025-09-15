import React, { useState } from 'react';
import { Header } from './components/Header';
import { RiskCard } from './components/RiskCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Footer } from './components/Footer';
import { ViewSwitcher } from './components/ViewSwitcher';
import { ReportTypeSwitcher } from './components/ReportTypeSwitcher';
import { useDailyRisks } from './hooks/useDailyRisks';
import { useWeeklyRisks } from './hooks/useWeeklyRisks';
import { useMonthlyRisks } from './hooks/useMonthlyRisks';
import { useYearlyRisks } from './hooks/useYearlyRisks';
import { useFraudEvents } from './hooks/useFraudEvents';
import { useCybersecurityIncidents } from './hooks/useCybersecurityIncidents';
import type { Risk, DailyBriefData } from './types';

export type BriefView = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReportType = 'briefs' | 'fraud' | 'cyber';

const App: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('briefs');
  const [briefView, setBriefView] = useState<BriefView>('daily');
  
  const dailyBrief = useDailyRisks({ enabled: reportType === 'briefs' && briefView === 'daily' });
  const weeklyBrief = useWeeklyRisks({ enabled: reportType === 'briefs' && briefView === 'weekly' });
  const monthlyBrief = useMonthlyRisks({ enabled: reportType === 'briefs' && briefView === 'monthly' });
  const yearlyBrief = useYearlyRisks({ enabled: reportType === 'briefs' && briefView === 'yearly' });
  const fraudEvents = useFraudEvents({ enabled: reportType === 'fraud' });
  const cybersecurityIncidents = useCybersecurityIncidents({ enabled: reportType === 'cyber' });

  const handleRefresh = () => {
    if (reportType === 'fraud') {
      fraudEvents.refreshRisks();
      return;
    }
    if (reportType === 'cyber') {
      cybersecurityIncidents.refreshRisks();
      return;
    }

    switch (briefView) {
      case 'daily':
        dailyBrief.refreshRisks();
        break;
      case 'weekly':
        weeklyBrief.refreshRisks();
        break;
      case 'monthly':
        monthlyBrief.refreshRisks();
        break;
      case 'yearly':
        yearlyBrief.refreshRisks();
        break;
    }
  };
  
  const renderDailyBrief = (brief: { risks: DailyBriefData, loading: boolean, error: string | null, refreshRisks: () => void }) => {
     const { risks, loading, error, refreshRisks } = brief;

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-slate-400 animate-pulse">Aggregating daily intelligence...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg animate-fade-in">
          <h3 className="text-xl font-semibold text-red-400">An Error Occurred</h3>
          <p className="text-slate-400 mt-2">{error}</p>
          <button
            onClick={refreshRisks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      );
    }
    
    const sortedDates = Object.keys(risks).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700/50 rounded-lg animate-fade-in">
           <h3 className="text-xl font-semibold text-slate-300">No Briefing Data Found</h3>
           <p className="text-slate-400 mt-2">Could not retrieve the daily briefing. Please try fetching the data.</p>
           <button
             onClick={refreshRisks}
             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
           >
             Fetch Briefing
           </button>
        </div>
      );
    }
    
    return (
        <div className="space-y-8">
            {sortedDates.map(date => (
                <section key={date}>
                    <h2 className="text-lg font-semibold text-slate-300 border-b border-gray-700 pb-2 mb-4">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h2>
                    <div className="space-y-6">
                        {risks[date].map((risk, index) => (
                            <RiskCard key={risk.title} risk={risk} index={index} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
  };
  
  const renderSummaryBrief = (
    brief: { risks: Risk[], loading: boolean, error: string | null, refreshRisks: () => void },
    briefType: 'weekly' | 'monthly' | 'yearly' | 'fraud' | 'cyber'
  ) => {
    const { risks, loading, error, refreshRisks } = brief;

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-slate-400 animate-pulse">Aggregating {briefType} intelligence...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg animate-fade-in">
          <h3 className="text-xl font-semibold text-red-400">An Error Occurred</h3>
          <p className="text-slate-400 mt-2">{error}</p>
          <button
            onClick={refreshRisks}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      );
    }

    if (risks.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700/50 rounded-lg animate-fade-in">
           <h3 className="text-xl font-semibold text-slate-300">No Data Found</h3>
           <p className="text-slate-400 mt-2">Could not retrieve the {briefType} report. Please try again.</p>
           <button
             onClick={refreshRisks}
             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200"
           >
             Fetch Report
           </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {risks.map((risk, index) => (
          <RiskCard key={risk.title} risk={risk} index={index} />
        ))}
      </div>
    );
  };

  const renderFraudEvents = (brief: { risks: Risk[], loading: boolean, error: string | null, refreshRisks: () => void }) => {
    return renderSummaryBrief(brief, 'fraud');
  };
  
  const renderCybersecurityIncidents = (brief: { risks: Risk[], loading: boolean, error: string | null, refreshRisks: () => void }) => {
    return renderSummaryBrief(brief, 'cyber');
  };

  const isLoading = 
    (reportType === 'briefs' && briefView === 'daily' && dailyBrief.loading) ||
    (reportType === 'briefs' && briefView === 'weekly' && weeklyBrief.loading) ||
    (reportType === 'briefs' && briefView === 'monthly' && monthlyBrief.loading) ||
    (reportType === 'briefs' && briefView === 'yearly' && yearlyBrief.loading) ||
    (reportType === 'fraud' && fraudEvents.loading) ||
    (reportType === 'cyber' && cybersecurityIncidents.loading);

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Header onRefresh={handleRefresh} isLoading={isLoading} reportType={reportType} briefView={briefView} />
        <ReportTypeSwitcher currentReportType={reportType} onReportTypeChange={setReportType} />
        {reportType === 'briefs' && <ViewSwitcher currentView={briefView} onViewChange={setBriefView} />}
        
        <main className="mt-8">
          {reportType === 'briefs' && briefView === 'daily' && renderDailyBrief(dailyBrief)}
          {reportType === 'briefs' && briefView === 'weekly' && renderSummaryBrief(weeklyBrief, 'weekly')}
          {reportType === 'briefs' && briefView === 'monthly' && renderSummaryBrief(monthlyBrief, 'monthly')}
          {reportType === 'briefs' && briefView === 'yearly' && renderSummaryBrief(yearlyBrief, 'yearly')}
          {reportType === 'fraud' && renderFraudEvents(fraudEvents)}
          {reportType === 'cyber' && renderCybersecurityIncidents(cybersecurityIncidents)}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;