import React, { useState } from 'react';
import { Loanee } from '../types';
import { formatCurrency, getLoaneeTotalOutstanding } from '../lib/data';
import { 
  Users, 
  X, 
  History, 
  BellRing, 
  LineChart, 
  Phone, 
  ChevronRight, 
  Search, 
  Filter, 
  UserPlus, 
  ArrowUpRight 
} from 'lucide-react';

interface LoaneesTabProps {
  loanees: Loanee[];
  onSelectLoanee: (id: string) => void;
  onAddLoaneeClick: () => void;
}

export default function LoaneesTab({
  loanees,
  onSelectLoanee,
  onAddLoaneeClick
}: LoaneesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const hasLoanees = loanees.length > 0;

  // Filter loanees based on query
  const filteredLoanees = loanees.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery)
  );

  // Compute total outstanding across loanees
  const totalOutstanding = loanees.reduce((sum, l) => sum + getLoaneeTotalOutstanding(l), 0);

  if (!hasLoanees) {
    // Empty state - Screen 2 Mockup
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative min-h-[70vh]">
        {/* Sky-blue atmospheric gradient back plate */}
        <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent pointer-events-none" />

        <div className="z-10 flex flex-col items-center text-center max-w-sm space-y-6">
          {/* Circular avatar overlap */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 blur-2xl rounded-full" />
            <div className="bg-card w-32 h-32 rounded-full flex items-center justify-center shadow-lg border border-outline-variant/50 dark:border-outline/20 relative">
              <Users className="w-16 h-16 text-primary stroke-[1.25]" />
              <div className="absolute -bottom-1 -right-1 bg-error text-white w-9 h-9 rounded-full flex items-center justify-center border-4 border-card">
                <X className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Texts */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-on-surface">
              No loanees yet
            </h2>
            <p className="text-sm text-on-surface-variant font-medium dark:text-on-surface-variant opacity-85 leading-relaxed">
              Add your first loance to start tracking their payments and manage your credit ledger efficiently.
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onAddLoaneeClick}
            className="group px-8 py-3.5 cursor-pointer bg-primary-container hover:bg-primary transition-all duration-300 rounded-full active:scale-95 flex items-center gap-2 shadow-xl shadow-primary/15"
          >
            <UserPlus className="w-5 h-5 text-white" />
            <span className="font-semibold text-xs text-white uppercase tracking-wider">
              + Add Loanee
            </span>
          </button>
        </div>

        {/* Suggestion Bento-Lite Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-4xl z-10 px-2">
          {/* Option 1 */}
          <div className="bg-card p-4 rounded-xl border border-subtle flex flex-col items-start space-y-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
              Track History
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
              See every transaction made by your customers in one single-screen view.
            </p>
          </div>

          {/* Option 2 */}
          <div className="bg-card p-4 rounded-xl border border-subtle flex flex-col items-start space-y-2">
            <div className="p-2 bg-success/10 rounded-lg text-success">
              <BellRing className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
              Auto Reminders
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
              Get notified when daily expected micro-installments are overdue for any loanee.
            </p>
          </div>

          {/* Option 3 */}
          <div className="bg-card p-4 rounded-xl border border-subtle flex flex-col items-start space-y-2">
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
              Total Outstanding
            </h3>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
              View your combined credit exposure and operating balance across profiles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loaded Loanees view - Screen 4 mockup
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <section className="p-5 btn-hero text-white rounded-2xl shadow-lg border border-white/10 flex flex-col justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-primary-dim uppercase font-mono">
            TOTAL OUTSTANDING
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display leading-tight text-white select-all">
            {formatCurrency(totalOutstanding)}
          </h2>
        </div>

        <div className="flex justify-between mt-5 pt-3 border-t border-white/10 text-xs font-medium font-mono text-primary-dim">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary-dim" />
            <span>{loanees.length} Loanees Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-success">
            <ArrowUpRight className="w-4 h-4" />
            <span>+₹12k this month</span>
          </div>
        </div>
      </section>

      {/* Search & Filter row */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search loanees..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-subtle rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-0 focus:border-primary-container"
          />
        </div>
        <button className="p-3 bg-card border border-subtle rounded-xl flex items-center justify-center text-on-surface hover:brightness-105 active:scale-95 transition-all">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Loanees List */}
      <div className="flex flex-col gap-3">
        {filteredLoanees.map(loanee => {
          const outstanding = getLoaneeTotalOutstanding(loanee);
          const activeLoans = loanee.loans.filter(ln => ln.status === 'Active');

          return (
            <button
              key={loanee.id}
              onClick={() => onSelectLoanee(loanee.id)}
              className="w-full text-left p-4 bg-card border border-subtle rounded-2xl hover-row transition-all active:scale-[0.99] flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Abbreviation Avatar */}
                <div className={`w-12 h-12 rounded-full ${loanee.avatarColor} flex items-center justify-center text-white font-bold font-display text-base shadow-sm shrink-0`}>
                  {loanee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-on-surface leading-tight truncate group-hover:text-primary transition-colors">
                    {loanee.name}
                  </h3>
                  
                  {loanee.phone && (
                    <p className="text-[10px] font-mono font-medium text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {loanee.phone}
                    </p>
                  )}

                  <p className="text-[10px] text-on-surface-variant font-mono mt-1 font-semibold">
                    {activeLoans.length} active {activeLoans.length === 1 ? 'loan' : 'loans'} ·{' '}
                    <span className="text-outstanding font-bold font-mono">
                      {formatCurrency(outstanding)} outstanding
                    </span>
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}

        {filteredLoanees.length === 0 && (
          <div className="text-center py-12 text-sm text-on-surface-variant font-medium">
            No customer profile matches your search query.
          </div>
        )}
      </div>

      {/* Floating Action Button for prompt adding */}
      <button 
        onClick={onAddLoaneeClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-btn-gradient-green z-40 shadow-2xl flex items-center justify-center rounded-full text-white active:scale-90 hover:brightness-110 active:duration-100 transition-all cursor-pointer glow-green"
      >
        <UserPlus className="w-6 h-6 text-white" />
      </button>

      <div className="h-16" /> {/* spacer */}
    </div>
  );
}
