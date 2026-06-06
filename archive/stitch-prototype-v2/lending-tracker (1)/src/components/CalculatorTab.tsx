import React, { useState } from 'react';
import { Loanee } from '../types';
import { formatCurrency } from '../lib/data';
import { 
  Calculator, 
  ArrowRight, 
  ArrowLeft, 
  UserPlus, 
  Sparkles, 
  Check, 
  Phone, 
  Calendar, 
  FileText, 
  UserCheck, 
  X 
} from 'lucide-react';

interface CalculatorTabProps {
  loanees: Loanee[];
  onAddLoanee: (name: string, phone: string) => Loanee;
  onCreateLoan: (loaneeId: string, principal: number, dailyExpected: number, durationDays: number, startDate?: string) => void;
  onNavigate: (tab: 'home' | 'calculator' | 'loanees' | 'settings') => void;
}

export default function CalculatorTab({
  loanees,
  onAddLoanee,
  onCreateLoan,
  onNavigate
}: CalculatorTabProps) {
  // Wizard state: 'input' (Step 1: Calculator terms) or 'confirm' (Step 2: Confirm & Book details)
  const [viewState, setViewState] = useState<'input' | 'confirm'>('input');

  // Input state values
  const [principal, setPrincipal] = useState<number>(10000);
  const [interestRateInput, setInterestRateInput] = useState<number>(1);
  const [ratePeriod, setRatePeriod] = useState<'day' | 'month' | 'year'>('day');
  const [duration, setDuration] = useState<number>(50);
  const [durationUnit, setDurationUnit] = useState<'days' | 'months' | 'years'>('days');

  // Step 2 specific values (Loanee picker and customized start date)
  const [selectedLoaneeId, setSelectedLoaneeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  // Computed Values based on current input parameters
  let durationInDays = duration;
  if (durationUnit === 'days') {
    durationInDays = duration;
  } else if (durationUnit === 'months') {
    durationInDays = duration * 30; // Standard banker representation
  } else if (durationUnit === 'years') {
    durationInDays = duration * 365;
  }

  // T is duration normalized to the selected interest rate period
  let T = duration;
  if (ratePeriod === 'day') {
    T = durationInDays;
  } else if (ratePeriod === 'month') {
    if (durationUnit === 'days') {
      T = duration / 30;
    } else if (durationUnit === 'months') {
      T = duration;
    } else if (durationUnit === 'years') {
      T = duration * 12;
    }
  } else if (ratePeriod === 'year') {
    if (durationUnit === 'days') {
      T = duration / 365;
    } else if (durationUnit === 'months') {
      T = duration / 12;
    } else if (durationUnit === 'years') {
      T = duration;
    }
  }

  const interestEarned = Math.round(principal * (interestRateInput / 100) * T);
  const totalReceivable = principal + interestEarned;
  const dailyExpected = durationInDays > 0 ? Math.round(totalReceivable / durationInDays) : 0;

  // Helper date calculations for terms range preview
  const getEndDate = (start: string, days: number): string => {
    if (!start) return '';
    const date = new Date(start);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatLocalDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Step 1 Click Handler: Move to Step 2 review screen
  const handleProceedToConfirmation = () => {
    if (principal <= 0) {
      alert('Please enter a positive principal credit amount!');
      return;
    }
    if (durationInDays <= 0 || duration <= 0) {
      alert('Please configure a valid duration!');
      return;
    }
    // Automatically pre-fill primary loanee if available to streamline experience
    if (!selectedLoaneeId && loanees.length > 0) {
      setSelectedLoaneeId(loanees[0].id);
    }
    setViewState('confirm');
  };

  // Step 2 Quick Add: Create an customer profile immediately during confirmation
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    const newL = onAddLoanee(quickName, quickPhone);
    setSelectedLoaneeId(newL.id);
    setIsQuickAddOpen(false);
    setQuickName('');
    setQuickPhone('');
  };

  // Final confirmation logic: finalize booking contract
  const handleConfirmAndCreate = () => {
    if (!selectedLoaneeId) {
      alert('Please select or create a borrower customer account first!');
      return;
    }
    if (!startDate) {
      alert('Please specify a valid start date for this loan lifecycle!');
      return;
    }

    onCreateLoan(selectedLoaneeId, principal, dailyExpected, durationInDays, startDate);
    onNavigate('home');
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header & Status Dots */}
      <div className="flex justify-between items-start px-1">
        <div>
          <h2 className="text-xl font-bold font-display text-on-surface">
            {viewState === 'input' ? 'Loan Calculator' : 'Confirm Loan Details'}
          </h2>
          <p className="text-xs text-on-surface-variant font-medium dark:text-on-surface-variant/80 mt-1">
            {viewState === 'input' 
              ? 'Calculate custom credit limits, rates, terms, and estimated daily payouts.'
              : 'Approve dynamic interest terms, select borrower account, and book transaction.'}
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex flex-col items-end gap-1 shrink-0 bg-card py-1.5 px-3 rounded-xl border border-outline-variant/30 text-right">
          <span className="text-[9px] font-bold font-mono text-on-surface-variant uppercase tracking-wider">
            {viewState === 'input' ? 'STEP 1: SIMULATE' : 'STEP 2: CONFIRM'}
          </span>
          <div className="flex gap-1">
            <span className={`w-3 h-1.5 rounded-full ${viewState === 'input' ? 'bg-primary' : 'bg-gray-300 dark:bg-outline-variant/50'}`} />
            <span className={`w-3 h-1.5 rounded-full ${viewState === 'confirm' ? 'bg-primary' : 'bg-gray-300 dark:bg-outline-variant/50'}`} />
          </div>
        </div>
      </div>

      {viewState === 'input' ? (
        /* ================= STEP 1: CALCULATOR INPUTS ================= */
        <section className="bg-card rounded-2xl border border-subtle shadow-sm p-5 space-y-5 animate-in fade-in duration-200">
          
          {/* Principal Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
              Principal Amount (₹)
            </label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-on-surface-variant font-sans">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="500"
                value={principal === 0 ? '' : principal}
                onChange={e => setPrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-3 bg-input border border-subtle rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold text-sm"
                placeholder="100"
              />
            </div>
          </div>

          {/* Interest Rate & Rate Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
                Interest Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={interestRateInput || ''}
                  onChange={e => setInterestRateInput(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pr-8 pl-3.5 py-3 bg-input border border-subtle rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold text-sm"
                  placeholder="1"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant font-mono">
                  %
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
                Rate Period
              </label>
              <select
                value={ratePeriod}
                onChange={e => setRatePeriod(e.target.value as 'day' | 'month' | 'year')}
                className="w-full text-xs p-3.5 bg-input border border-subtle rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold h-[46px]"
              >
                <option value="day">per day</option>
                <option value="month">per month</option>
                <option value="year">per year</option>
              </select>
            </div>
          </div>

          {/* Duration Length & Duration Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
                Duration Length
              </label>
              <input
                type="number"
                min="1"
                value={duration || ''}
                onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-3 bg-input border border-subtle rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold text-sm"
                placeholder="50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
                Duration Unit
              </label>
              <select
                value={durationUnit}
                onChange={e => setDurationUnit(e.target.value as 'days' | 'months' | 'years')}
                className="w-full text-xs p-3.5 bg-input border border-subtle rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold h-[46px]"
              >
                <option value="days">days</option>
                <option value="months">months</option>
                <option value="years">years</option>
              </select>
            </div>
          </div>

          {/* Terms Simulation Box */}
          <div className="bg-primary/5 dark:bg-input p-4 rounded-xl border border-primary/20 block space-y-3">
            <div className="flex justify-between items-center animate-pulse">
              <span className="text-xs font-semibold text-on-surface-variant font-mono">
                Computed Daily Payment
              </span>
              <span className="text-[10px] font-bold font-mono text-success dark:text-success bg-success/10 dark:bg-success/15 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Simulated Returns</span>
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-display text-primary dark:text-primary-dim font-mono">
                {formatCurrency(dailyExpected)}
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-wider">
                /day
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant ml-1">
                (for {durationInDays} days)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/30 text-xs text-on-surface-variant font-mono font-medium">
              <div>
                <span>Total Repayable: </span>
                <span className="font-bold text-on-surface font-mono">
                  {formatCurrency(totalReceivable)}
                </span>
              </div>
              <div>
                <span>Total Interest: </span>
                <span className="font-bold text-success dark:text-success font-mono">
                  {formatCurrency(interestEarned)}
                </span>
              </div>
            </div>
          </div>

          {/* Action: Next Step review terms */}
          <button
            onClick={handleProceedToConfirmation}
            className="w-full py-4 rounded-full bg-btn-gradient hover:brightness-110 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all text-sm cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-white" />
            <span>Verify Terms & Set Borrower</span>
            <ArrowRight className="w-4 h-4 text-white ml-0.5" />
          </button>

        </section>
      ) : (
        /* ================= STEP 2: LOANEE PICKER & CONFIRMATION ================= */
        <section className="bg-card rounded-2xl border border-subtle shadow-sm p-5 space-y-5 animate-in slide-in-from-right-5 duration-200">
          
          {/* LOANEE PICKER FIELD */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
              <span>Select Borrower customer</span>
              <button
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="text-primary dark:text-primary-dim hover:brightness-115 flex items-center gap-1 cursor-pointer font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isQuickAddOpen ? 'Back to Selector' : 'Create New Client'}</span>
              </button>
            </div>

            {isQuickAddOpen ? (
              /* Inside Step 2: Instant borrower profile dynamic form */
              <form onSubmit={handleQuickAdd} className="bg-input p-3.5 rounded-xl border border-dashed border-outline-variant/50 space-y-3">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  Create fresh Customer ledger profile
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Borrower Full Name"
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    className="bg-card border border-outline-variant dark:border-outline/30 rounded-lg p-2.5 text-xs focus:ring-0 focus:border-primary-container outline-none text-on-surface font-sans"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Contact"
                    value={quickPhone}
                    onChange={e => setQuickPhone(e.target.value)}
                    className="bg-card border border-outline-variant dark:border-outline/30 rounded-lg p-2.5 text-xs focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary-dim py-2 rounded-lg text-xs font-bold hover:bg-primary/15 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Register Borrower Profile</span>
                </button>
              </form>
            ) : (
              /* Traditional drop down picker list of borrower profiles */
              <div className="space-y-2">
                <select
                  value={selectedLoaneeId}
                  onChange={e => setSelectedLoaneeId(e.target.value)}
                  className="w-full text-sm p-3.5 bg-input border border-outline-variant dark:border-outline/20 rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-sans font-medium"
                >
                  <option value="" disabled>--- Choose Customer Profile ---</option>
                  {loanees.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} {l.phone ? `(${l.phone})` : ''}
                    </option>
                  ))}
                </select>
                {loanees.length === 0 && (
                  <p className="text-[10px] text-error font-medium">
                    No customers found on this device! Click "Create New Client" above first.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CUSTOMIZABLE START DATE PICKER (Defaulting to today) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary dark:text-primary-dim" />
              <span>Contract Launch date</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-3.5 bg-input border border-subtle rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold text-sm"
              required
            />
          </div>

          {/* DETAILED LEDGER TRANSACTION SUMMARY */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase font-mono tracking-widest flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Official Ledger Terms Summary</span>
            </p>

            <div className="bg-input p-4 rounded-xl border border-outline-variant/30 space-y-3 text-xs">
              
              {/* Row 1: Principal & Cost */}
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Credit Principal</span>
                <span className="font-bold text-on-surface font-mono">{formatCurrency(principal)}</span>
              </div>

              {/* Row 2: Interest Terms */}
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Interest Ratio</span>
                <span className="font-semibold text-on-surface font-mono">
                  {interestRateInput}% per {ratePeriod}
                </span>
              </div>

              {/* Row 3: Term range */}
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Active Duration</span>
                <span className="font-semibold text-on-surface font-mono">
                  {duration} {durationUnit} ({durationInDays} days)
                </span>
              </div>

              {/* Row 4: Start to computed end date */}
              <div className="flex justify-between items-center border-t border-dashed border-outline-variant/40 pt-2 text-[11px]">
                <span className="text-on-surface-variant font-medium">Agreement Term</span>
                <span className="font-bold text-on-surface font-mono">
                  {formatLocalDate(startDate)} – {getEndDate(startDate, durationInDays)}
                </span>
              </div>

              {/* Row 5: Financial Metrics Highlight Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-outline-variant/40 text-center">
                <div className="bg-card p-2 rounded-lg border border-outline-variant/20">
                  <p className="text-[9px] text-on-surface-variant uppercase font-mono tracking-wider font-bold">Payout Rate</p>
                  <p className="font-black text-xs text-primary dark:text-primary-dim font-mono mt-0.5">{formatCurrency(dailyExpected)}/d</p>
                </div>
                <div className="bg-card p-2 rounded-lg border border-outline-variant/20">
                  <p className="text-[9px] text-on-surface-variant uppercase font-mono tracking-wider font-bold">Total Interest</p>
                  <p className="font-black text-xs text-success mt-0.5 font-mono">+{formatCurrency(interestEarned)}</p>
                </div>
                <div className="bg-card p-2 rounded-lg border border-outline-variant/20">
                  <p className="text-[9px] text-on-surface-variant uppercase font-mono tracking-wider font-bold">Total Return</p>
                  <p className="font-black text-xs text-on-surface mt-0.5 font-mono">{formatCurrency(totalReceivable)}</p>
                </div>
              </div>

            </div>
          </div>

          {/* ACTION BUTTONS (CONFIRM AND BACK) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => setViewState('input')}
              className="flex-1 py-4 border border-outline-variant text-on-surface-variant hover:bg-gray-50 rounded-full text-xs font-semibold cursor-pointer active:scale-95 duration-100 flex items-center justify-center gap-1.5 order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Calculator</span>
            </button>
            <button
              onClick={handleConfirmAndCreate}
              className="flex-[2] py-4 rounded-full bg-btn-gradient text-white hover:brightness-110 font-bold text-xs active:scale-95 duration-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer order-1 sm:order-2"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>Confirm & Book Active Loan</span>
            </button>
          </div>

        </section>
      )}
    </div>
  );
}
