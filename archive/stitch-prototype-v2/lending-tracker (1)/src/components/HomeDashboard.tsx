import React from 'react';
import { Loanee, Loan } from '../types';
import { formatCurrency, getGlobalStats, getLoanOutstanding, getLoaneeTotalOutstanding } from '../lib/data';
import { 
  TrendingUp, 
  Group, 
  Wallet, 
  Calculator, 
  UserPlus, 
  ChevronRight, 
  Plus, 
  LineChart, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

interface HomeDashboardProps {
  loanees: Loanee[];
  onNavigate: (tab: 'home' | 'calculator' | 'loanees' | 'settings') => void;
  onSelectLoanee: (id: string) => void;
  onAddLoaneeClick: () => void;
}

export default function HomeDashboard({
  loanees,
  onNavigate,
  onSelectLoanee,
  onAddLoaneeClick,
}: HomeDashboardProps) {
  const { totalLoaned, totalReceived, totalOutstanding, activeLoansCount } = getGlobalStats(loanees);

  // If there are no active loans at all, show the Screen 1 empty state
  const hasActiveLoans = activeLoansCount > 0;

  if (!hasActiveLoans) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden min-h-[70vh]">
        {/* Subtle decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 dark:bg-primary/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-md w-full flex flex-col items-center text-center z-10 space-y-6">
          {/* Illustration Wallet area */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary-container/20 rounded-full blur-xl group-hover:bg-primary-container/30 transition-all duration-700 opacity-60" />
            <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-card border border-subtle shadow-lg">
              <Wallet className="w-16 h-16 text-primary stroke-[1.25]" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-on-surface">
              No active loans
            </h2>
            <p className="text-on-surface-variant font-medium dark:text-on-surface-variant max-w-[280px] mx-auto mt-2 opacity-85">
              Start by calculating a new loan or adding a loance.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full">
            <button
              onClick={() => onNavigate('calculator')}
              className="bg-btn-gradient text-white hover:brightness-110 cursor-pointer font-semibold px-10 py-3.5 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all duration-200 flex items-center gap-2 group w-fit"
            >
              <Calculator className="w-5 h-5 transition-transform group-hover:rotate-12 text-white" />
              <span>Calculate Loan</span>
            </button>

            <button
              onClick={onAddLoaneeClick}
              className="font-semibold text-sm cursor-pointer text-primary hover:brightness-125 transition-all flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-input active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add a Loanee</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Loans exist: Render Screen 5 Dashboard / Metrics
  const activeLoansList: { loanee: Loanee; loan: Loan }[] = [];
  loanees.forEach(loanee => {
    loanee.loans.forEach(loan => {
      if (loan.status === 'Active') {
        activeLoansList.push({ loanee, loan });
      }
    });
  });

  // Calculate high outstanding loanees to show in donut chart (Take up to 3, combine rest as 'Other')
  const loaneeOutstandingList = loanees
    .map(l => ({
      name: l.name,
      outstanding: getLoaneeTotalOutstanding(l),
    }))
    .filter(i => i.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding);

  const totalOutstandingSum = loaneeOutstandingList.reduce((sum, item) => sum + item.outstanding, 0);

  // SVG parameters for Donut Chart
  const donutSize = 140;
  const strokeWidth = 14;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Render SVG segments
  let currentAccumulatorOffset = 0;
  const colors = [
    'stroke-primary dark:stroke-primary-dim',
    'stroke-warning',
    'stroke-success',
    'stroke-primary-dim',
    'stroke-primary',
    'stroke-warning',
  ];
  const bgColors = [
    'bg-primary',
    'bg-warning',
    'bg-success',
    'bg-primary-dim',
    'bg-primary',
    'bg-warning',
  ];

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Card 1: Total Loaned */}
        <div className="p-4 bg-card rounded-2xl border border-subtle shadow-sm flex flex-col justify-between">
          <p className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant font-mono">
            TOTAL LOANED
          </p>
          <div className="mt-2 space-y-1">
            <h3 className="text-lg md:text-xl font-bold font-display text-primary dark:text-stat">
              {formatCurrency(totalLoaned)}
            </h3>
            <p className="text-[10px] text-success font-medium font-mono flex items-center gap-0.5">
              <span>Principal investment</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Received */}
        <div className="p-4 bg-card rounded-2xl border border-subtle shadow-sm flex flex-col justify-between">
          <p className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant font-mono">
            TOTAL RECEIVED
          </p>
          <div className="mt-2 space-y-1">
            <h3 className="text-lg md:text-xl font-bold font-display text-success">
              {formatCurrency(totalReceived)}
            </h3>
            <p className="text-[10px] text-success font-medium font-mono flex items-center gap-0.5">
              <span>Collected returns</span>
            </p>
          </div>
        </div>

        {/* Card 3: Outstanding */}
        <div className="p-4 bg-card rounded-2xl border border-subtle shadow-sm flex flex-col justify-between">
          <p className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant font-mono">
            OUTSTANDING
          </p>
          <div className="mt-2 space-y-1">
            <h3 className="text-lg md:text-xl font-bold font-display text-warning">
              {formatCurrency(totalOutstanding)}
            </h3>
            <p className="text-[10px] text-warning font-medium font-mono">
              Uncollected balance
            </p>
          </div>
        </div>

        {/* Card 4: Active Loans */}
        <div className="p-4 bg-card rounded-2xl border border-subtle shadow-sm flex flex-col justify-between">
          <p className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant font-mono">
            ACTIVE LOANS
          </p>
          <div className="mt-2 space-y-1">
            <h3 className="text-lg md:text-xl font-bold font-display text-on-surface dark:text-stat">
              {activeLoansCount}
            </h3>
            <p className="text-[10px] text-on-surface-variant font-mono">
              Operating ledgers
            </p>
          </div>
        </div>
      </section>

      {/* Outstanding by Loanee Donut Block */}
      <section className="p-5 bg-card rounded-2xl border border-subtle shadow-sm space-y-4">
        <h3 className="text-base font-semibold font-display text-on-surface">
          Outstanding by loanee
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Circular Donut Ring using SVG */}
          <div className="relative w-[140px] h-[140px] flex items-center justify-center">
            <svg width={donutSize} height={donutSize} className="-rotate-90">
              {/* Backing circle */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                className="fill-none stroke-track"
                strokeWidth={strokeWidth}
              />
              {/* Segments */}
              {totalOutstandingSum > 0 ? (
                loaneeOutstandingList.map((item, idx) => {
                  const percentage = item.outstanding / totalOutstandingSum;
                  const segmentLength = circumference * percentage;
                  const segmentGap = circumference - segmentLength;
                  const offset = circumference - currentAccumulatorOffset;
                  currentAccumulatorOffset += segmentLength;

                  const colorClass = colors[idx % colors.length];

                  return (
                    <circle
                      key={item.name}
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      className={`fill-none ${colorClass} transition-all duration-500`}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${segmentLength} ${segmentGap}`}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  );
                })
              ) : null}
            </svg>

            {/* Float values inside donut */}
            <div className="absolute text-center">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                Active Debt
              </span>
              <p className="text-sm font-bold font-display text-on-surface leading-tight">
                {loaneeOutstandingList.length} Accounts
              </p>
            </div>
          </div>

          {/* Color co-ordinated details */}
          <div className="flex-1 space-y-2.5 w-full">
            {loaneeOutstandingList.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${bgColors[idx % bgColors.length]}`} />
                  <span className="text-on-surface font-semibold">
                    {item.name}
                  </span>
                </div>
                <span className="text-on-surface-variant font-mono">
                  {formatCurrency(item.outstanding)}
                </span>
              </div>
            ))}
            {loaneeOutstandingList.length > 4 && (
              <div className="flex items-center justify-between text-xs font-medium pt-1 border-t border-dashed border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-on-surface-variant">Others</span>
                </div>
                <span className="text-on-surface-variant font-mono">
                  {formatCurrency(
                    loaneeOutstandingList.slice(4).reduce((sum, item) => sum + item.outstanding, 0)
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Column double bar chart: expected vs received */}
      <section className="p-5 bg-card rounded-2xl border border-subtle shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold font-display text-on-surface">
            This Week — Expected vs Received
          </h3>
          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            7-day view
          </span>
        </div>

        {/* Bar chart graphics */}
        <div className="h-44 flex items-end justify-between pt-6 px-1 gap-2 border-b border-subtle">
          {[
            { day: 'MON', exp: 3900, rec: 3200 },
            { day: 'TUE', exp: 4200, rec: 3900 },
            { day: 'WED', exp: 5100, rec: 5100 },
            { day: 'THU', exp: 3500, rec: 2800 },
            { day: 'FRI', exp: 6800, rec: 5900 },
            { day: 'SAT', exp: 2400, rec: 1900 },
            { day: 'SUN', exp: 1200, rec: 1200 }
          ].map(it => {
            // max expected is 6800. Scale out of 100px height.
            const expHeight = (it.exp / 6800) * 105;
            const recHeight = (it.rec / 6800) * 105;

            return (
              <div key={it.day} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                {/* Visual side-by-side bars */}
                <div className="flex items-end gap-1 relative w-full justify-center">
                  {/* Expected Bar */}
                  <div
                    className="w-1.5 sm:w-2 bg-chart-expected rounded-t-full transition-all group-hover:brightness-95"
                    style={{ height: `${expHeight}px` }}
                    title={`Expected: ₹${it.exp}`}
                  />
                  {/* Received Bar */}
                  <div
                    className="w-1.5 sm:w-2 bg-success rounded-t-full transition-all group-hover:brightness-110"
                    style={{ height: `${recHeight}px` }}
                    title={`Received: ₹${it.rec}`}
                  />
                </div>
                <span className="text-[10px] font-bold font-mono tracking-wide text-on-surface-variant mt-2">
                  {it.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-chart-expected rounded-full" />
            <span className="text-on-surface-variant font-mono">Expected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-success rounded-full" />
            <span className="text-on-surface-variant font-mono">Received</span>
          </div>
        </div>
      </section>

      {/* Area Collections sparkline chart */}
      <section className="p-5 bg-card rounded-2xl border border-subtle shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-semibold font-display text-on-surface">
            Collections — Last 30 Days
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5 opacity-80">
            Total inflow peak cycles over month records
          </p>
        </div>

        <div className="relative h-24 w-full overflow-hidden text-primary dark:text-primary-dim">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            {/* Gradient fill */}
            <defs>
              <linearGradient id="collectionsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Sparkline Path */}
            <path
              d="M 0 80 Q 25 78 50 64 T 100 68 T 150 42 T 200 48 T 250 82 T 300 28 T 350 44 L 400 15 L 400 100 L 0 100 Z"
              fill="url(#collectionsGrad)"
            />
            <path
              d="M 0 80 Q 25 78 50 64 T 100 68 T 150 42 T 200 48 T 250 82 T 300 28 T 350 44 L 400 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>

      {/* Active Loans Section with Progress bars */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold font-display text-on-surface">
            Active Loans
          </h3>
          <button
            onClick={() => onNavigate('loanees')}
            className="text-xs cursor-pointer font-semibold text-primary hover:brightness-110 flex items-center"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Scrollable grid listing */}
        <div className="flex flex-col gap-3">
          {activeLoansList.map(({ loanee, loan }) => {
            const outstanding = getLoanOutstanding(loan);
            
            // Calculate progress parameters
            const daysPassed = Math.min(
              loan.payments.length, 
              loan.durationDays
            );
            const progressPct = Math.round((daysPassed / loan.durationDays) * 100);

            return (
              <button
                key={loan.id}
                onClick={() => onSelectLoanee(loanee.id)}
                className="w-full text-left p-4 bg-card hover-row border border-subtle rounded-2xl transition-all duration-150 active:scale-[0.99] flex items-center gap-4 group cursor-pointer"
              >
                {/* Initial circle avatar */}
                <div className={`w-12 h-12 rounded-full ${loanee.avatarColor} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}>
                  {loanee.name.split(' ').map(n=>n[0]).join('')}
                </div>

                {/* Info block */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-on-surface leading-tight truncate group-hover:text-primary transition-colors">
                        {loanee.name}
                      </h4>
                      <p className="text-[10px] font-medium font-mono text-on-surface-variant">
                        ₹{loan.dailyExpected}/day
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-bold text-outstanding leading-tight">
                        {formatCurrency(outstanding)}
                      </p>
                      <span className="text-[9px] font-mono tracking-wider text-on-surface-variant uppercase font-medium">
                        Outstanding
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-on-surface-variant font-mono">
                      <span>Progress: {daysPassed} of {loan.durationDays} days</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-track rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary dark:bg-primary-container shadow-[0_0_8px_rgba(59,102,245,0.35)] rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Floating Action Button (FAB) at index container level or bottom navbar */}
      <div className="h-16" /> {/* spacer */}
    </div>
  );
}
