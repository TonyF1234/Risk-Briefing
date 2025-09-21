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
import { useFraudEvents, type FraudEventsState } from './hooks/useFraudEvents';
import { useCybersecurityIncidents, type CybersecurityIncidentsState } from './hooks/useCybersecurityIncidents';
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
    briefType: 'weekly' | 'monthly' | 'yearly'
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

  const renderGroupedByMonthReport = (
    brief: FraudEventsState | CybersecurityIncidentsState,
    reportType: 'fraud' | 'cyber'
  ) => {
    const { risks, loading, error, refreshRisks, searchStatus } = brief;

    if (loading && risks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <LoadingSpinner />
          <p className="mt-4 text-slate-400 animate-pulse">Aggregating {reportType} events...</p>
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

    const groupedByMonth = risks.reduce((acc, risk) => {
      let monthKey = 'Date Unknown';
      if (risk.date) {
        // First, try parsing as YYYY-MM-DD which can have timezone issues if not handled.
        const dateWithTimezoneFix = new Date(risk.date + 'T00:00:00');
        // Fallback for more general date formats
        const flexibleDate = new Date(risk.date);

        const d = !isNaN(dateWithTimezoneFix.getTime()) ? dateWithTimezoneFix : flexibleDate;

        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          monthKey = `${year}-${month}`;
        }
      }

      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(risk);
      return acc;
    }, {} as Record<string, Risk[]>);

    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
      if (a === 'Date Unknown') return 1; // Put 'Date Unknown' at the end
      if (b === 'Date Unknown') return -1;
      return b.localeCompare(a); // Sort other dates descending (e.g., 2024-07 before 2024-06)
    });

    if (sortedMonths.length === 0 && !loading) {
      return (
        <div className="text-center p-8 bg-gray-800/50 border border-gray-700/50 rounded-lg animate-fade-in">
           <h3 className="text-xl font-semibold text-slate-300">No Events Found</h3>
           <p className="text-slate-400 mt-2">Could not retrieve the {reportType} events report. Please try again.</p>
           <button
             onClick={refreshRisks}
             disabled={loading}
             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50"
           >
             {loading ? 'Fetching...' : 'Fetch Initial Report'}
           </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-800/50 border-b border-gray-700/50 sticky top-0 z-10 backdrop-blur-sm">
          <button
            onClick={refreshRisks}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {loading ? 'Searching...' : 'Find New Incidents'}
          </button>
          <div className="h-6 text-sm flex-grow text-left">
            {searchStatus === 'found' && <p className="text-green-400 animate-fade-in">New incidents added to the list!</p>}
            {searchStatus === 'not_found' && <p className="text-slate-400 animate-fade-in">No new incidents found.</p>}
          </div>
        </div>
        {sortedMonths.map(month => (
          <section key={month}>
            <h2 className="text-lg font-semibold text-slate-300 border-b border-gray-700 pb-2 mb-4">
              {month === 'Date Unknown'
                ? 'Date Unknown'
                : new Date(month + '-02T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </h2>
            <div className="space-y-6">
              {groupedByMonth[month].map((risk, index) => (
                <RiskCard key={`${risk.title}-${index}`} risk={risk} index={index} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
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
          {reportType === 'fraud' && renderGroupedByMonthReport(fraudEvents, 'fraud')}
          {reportType === 'cyber' && renderGroupedByMonthReport(cybersecurityIncidents, 'cyber')}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
