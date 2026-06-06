import React, { useState } from 'react';
import { Loanee, Loan, Payment } from '../types';
import { formatCurrency, getLoanOutstanding } from '../lib/data';
import { 
  ArrowLeft, 
  MoreVertical, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Hourglass, 
  PlusCircle, 
  Trash2, 
  Info,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Coins,
  Check
} from 'lucide-react';

interface LoaneeDetailViewProps {
  loanee: Loanee;
  onBack: () => void;
  onUpdatePayments: (loaneeId: string, loanId: string, updatedPayments: Payment[]) => void;
  onExtendLoan: (loaneeId: string, loanId: string, addedDays: number, mode: 'keep' | 'recalculate') => void;
  onCloseLoan: (loaneeId: string, loanId: string) => void;
}

export default function LoaneeDetailView({
  loanee,
  onBack,
  onUpdatePayments,
  onExtendLoan,
  onCloseLoan,
}: LoaneeDetailViewProps) {
  // Find active loan or fall back to first loan
  const activeLoan = loanee.loans.find(ln => ln.status === 'Active') || loanee.loans[0];

  // Selected ledger filter state
  const [filterType, setFilterType] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial'>('All');

  // Bottom Sheet status override state
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState<Payment | null>(null);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');

  // Close confirmation modal state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Extend Loan states & terms picker adjustments
  const [isExtendViewOpen, setIsExtendViewOpen] = useState(false);
  const [addedDaysInput, setAddedDaysInput] = useState<number>(10);
  const [extendMode, setExtendMode] = useState<'keep' | 'recalculate'>('keep');

  const getEndDateStr = (startDateStr: string, totalDays: number) => {
    if (!startDateStr) return '';
    try {
      const date = new Date(startDateStr);
      date.setDate(date.getDate() + totalDays);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  if (!activeLoan) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-on-surface-variant font-medium">No loans booked for this customer yet.</p>
        <button onClick={onBack} className="p-2 bg-primary/10 text-primary rounded-lg font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const outstanding = getLoanOutstanding(activeLoan);
  const totalPrincipal = activeLoan.principal;
  const expectedInstallment = activeLoan.dailyExpected;

  // Derive days details
  const daysPassed = activeLoan.payments.length;
  const progressPct = Math.min(100, Math.round((daysPassed / activeLoan.durationDays) * 100));

  // Today's ledger element is the very last payment item
  const todayPayment = activeLoan.payments[activeLoan.payments.length - 1];
  const pastPayments = activeLoan.payments.slice(0, activeLoan.payments.length - 1).reverse();

  // Filter payment records
  const filteredPastPayments = pastPayments.filter(p => {
    if (filterType === 'All') return true;
    return p.status === filterType;
  });

  // Action: Toggling Today's Payment
  const handleTodayStatChange = (status: 'Paid' | 'Unpaid') => {
    if (!todayPayment) return;
    const updated = activeLoan.payments.map(p => {
      if (p.id === todayPayment.id) {
        return {
          ...p,
          status,
          paidAmount: status === 'Paid' ? expectedInstallment : 0
        };
      }
      return p;
    });
    onUpdatePayments(loanee.id, activeLoan.id, updated);
  };

  // Action: Launching custom amount bottom sheet
  const handlePastRowClick = (payment: Payment) => {
    setSelectedPaymentForEdit(payment);
    setCustomAmountInput(payment.paidAmount.toString());
  };

  // Action: Saving custom amount bottom sheet input
  const handleSaveCustomAmount = () => {
    if (!selectedPaymentForEdit) return;
    const amountVal = parseFloat(customAmountInput) || 0;
    let computedStatus: 'Paid' | 'Unpaid' | 'Partial' = 'Paid';
    
    if (amountVal === 0) {
      computedStatus = 'Unpaid';
    } else if (amountVal < selectedPaymentForEdit.expected) {
      computedStatus = 'Partial';
    }

    const updated = activeLoan.payments.map(p => {
      if (p.id === selectedPaymentForEdit.id) {
        return {
          ...p,
          paidAmount: amountVal,
          status: computedStatus
        };
      }
      return p;
    });

    onUpdatePayments(loanee.id, activeLoan.id, updated);
    setSelectedPaymentForEdit(null);
  };

  // Keyboard layout visualization action
  const appendNumber = (num: string) => {
    if (num === '.') {
      if (!customAmountInput.includes('.')) {
        setCustomAmountInput(prev => prev + num);
      }
    } else {
      setCustomAmountInput(prev => prev === '0' ? num : prev + num);
    }
  };

  const deleteLastDigit = () => {
    setCustomAmountInput(prev => prev.slice(0, -1) || '0');
  };

  // Action: confirm closure callback
  const handleConfirmClose = () => {
    onCloseLoan(loanee.id, activeLoan.id);
    setIsCloseModalOpen(false);
    onBack();
  };

  if (isExtendViewOpen) {
    const totalPaid = activeLoan.payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalExpectedOriginal = activeLoan.expectedContractValue !== undefined 
      ? activeLoan.expectedContractValue 
      : activeLoan.dailyExpected * activeLoan.durationDays;
    
    const currentRemainingDays = Math.max(0, activeLoan.durationDays - daysPassed);
    const newRemainingDays = currentRemainingDays + addedDaysInput;
    const newTotalDuration = activeLoan.durationDays + addedDaysInput;

    const originalEndDate = getEndDateStr(activeLoan.startDate, activeLoan.durationDays);
    const extendedEndDate = getEndDateStr(activeLoan.startDate, newTotalDuration);

    // Keep Daily calculations
    const keepDailyRate = activeLoan.dailyExpected;
    const keepTotalExpected = totalExpectedOriginal + (addedDaysInput * activeLoan.dailyExpected);
    const keepNewOutstanding = outstanding + (addedDaysInput * activeLoan.dailyExpected);

    // Recalculate calculations
    const recalcDailyRate = newRemainingDays > 0 ? Math.round(outstanding / newRemainingDays) : 0;
    const recalcTotalExpected = totalPaid + (newRemainingDays * recalcDailyRate);
    const recalcNewOutstanding = newRemainingDays * recalcDailyRate;

    const selectedDailyRate = extendMode === 'keep' ? keepDailyRate : recalcDailyRate;
    const selectedTotalExpected = extendMode === 'keep' ? keepTotalExpected : recalcTotalExpected;
    const selectedNewOutstanding = extendMode === 'keep' ? keepNewOutstanding : recalcNewOutstanding;

    const handleConfirmExtension = () => {
      if (addedDaysInput <= 0) {
        alert('Please enter a positive duration range to extend!');
        return;
      }
      onExtendLoan(loanee.id, activeLoan.id, addedDaysInput, extendMode);
      setIsExtendViewOpen(false);
    };

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-200">
        <header className="flex items-center gap-3 py-1">
          <button
            onClick={() => setIsExtendViewOpen(false)}
            className="w-10 h-10 cursor-pointer flex items-center justify-center active:scale-95 text-on-surface hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold font-display text-on-surface leading-tight">
              Extend Loan Term
            </h1>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              Refocus duration and installment layout for {loanee.name}
            </p>
          </div>
        </header>

        {/* Current Outstanding Debt metric card */}
        <section className="bg-card rounded-2xl border border-outline-variant/30 p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Outstanding Balance
              </p>
              <h2 className="text-2xl font-extrabold font-display text-primary dark:text-primary-dim font-mono mt-0.5">
                {formatCurrency(outstanding)}
              </h2>
            </div>
            <div className="bg-primary/5 dark:bg-primary/10 p-2.5 rounded-xl border border-primary/20 dark:border-primary/20 text-primary dark:text-primary-dim">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-outline-variant/30 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-on-surface-variant block uppercase font-bold text-[9px]">Original term</span>
              <span className="font-bold text-on-surface">{activeLoan.durationDays} Days</span>
            </div>
            <div>
              <span className="text-on-surface-variant block uppercase font-bold text-[9px]">Elapsed Days</span>
              <span className="font-bold text-on-surface">{daysPassed} Days</span>
            </div>
          </div>
        </section>

        {/* Dynamic Duration Settings Section */}
        <section className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
            How many days to extend?
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={addedDaysInput || ''}
              onChange={e => setAddedDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 bg-card border border-outline-variant/30 rounded-xl focus:ring-0 focus:border-primary-container outline-none text-on-surface font-mono font-bold text-sm"
              placeholder="10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant font-mono">
              Days
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 15, 30, 45].map(days => (
              <button
                key={days}
                onClick={() => setAddedDaysInput(days)}
                className={`py-2 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                  addedDaysInput === days
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-card border-outline-variant/30 text-on-surface-variant hover:bg-gray-50'
                }`}
              >
                +{days}d
              </button>
            ))}
          </div>
        </section>

        {/* Selected Extension Rule Selector */}
        <section className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider font-mono text-on-surface-variant">
            Installment Adjustment Mode
          </label>

          <div className="space-y-2.5">
            <div 
              onClick={() => setExtendMode('keep')}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                extendMode === 'keep'
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/80 shadow-sm'
                  : 'bg-card border-outline-variant/30 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  extendMode === 'keep' ? 'border-primary' : 'border-gray-300'
                }`}>
                  {extendMode === 'keep' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-on-surface font-sans">
                    Keep Same Daily Payment ({formatCurrency(keepDailyRate)}/day)
                  </p>
                  <p className="text-[10px] text-on-surface-variant leading-normal font-medium font-sans">
                    Installment amount does not change. Standard compound extension expands total agreement return yield into higher gains.
                  </p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExtendMode('recalculate')}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                extendMode === 'recalculate'
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/80 shadow-sm'
                  : 'bg-card border-outline-variant/30 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  extendMode === 'recalculate' ? 'border-primary' : 'border-gray-300'
                }`}>
                  {extendMode === 'recalculate' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-on-surface font-sans">
                    Recalculate Daily Payouts ({formatCurrency(recalcDailyRate)}/day)
                  </p>
                  <p className="text-[10px] text-on-surface-variant leading-normal font-medium font-sans">
                    Lower customer fiscal burden. Outstanding remaining balance is spread across the new extended term.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projection live stats card */}
        <section className="bg-input p-4 rounded-2xl border border-outline-variant/20 block space-y-3">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary dark:text-primary-dim" />
            <span>Extending projection model</span>
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-card p-2.5 rounded-xl border border-outline-variant/10 text-center space-y-1">
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-mono block font-bold">Daily Payment</span>
              <p className="font-bold font-mono text-on-surface">
                {formatCurrency(activeLoan.dailyExpected)} <span className="text-gray-400 font-normal">→</span> <span className="text-primary dark:text-primary-dim font-black">{formatCurrency(selectedDailyRate)}</span>
              </p>
            </div>

            <div className="bg-card p-2.5 rounded-xl border border-outline-variant/10 text-center space-y-1">
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-mono block font-bold">End Date</span>
              <p className="font-bold text-[10px] font-mono text-on-surface truncate">
                {originalEndDate} <span className="text-gray-400 font-normal">→</span> <span className="text-primary dark:text-primary-dim font-bold">{extendedEndDate}</span>
              </p>
            </div>

            <div className="bg-card p-2.5 rounded-xl border border-outline-variant/10 text-center col-span-2 space-y-1">
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-mono block font-bold">Total Agreement Payback</span>
              <p className="font-bold font-mono text-on-surface">
                {formatCurrency(totalExpectedOriginal)} <span className="text-gray-400 font-normal">→</span> <span className="font-black text-success">{formatCurrency(selectedTotalExpected)}</span>
              </p>
              {extendMode === 'keep' ? (
                <span className="text-[9px] text-success font-mono block font-bold">
                  (+ {formatCurrency(addedDaysInput * activeLoan.dailyExpected)} custom rate interest yield added)
                </span>
              ) : (
                <span className="text-[9px] text-on-surface-variant font-mono block">
                  (Outstanding ₹{formatCurrency(outstanding)} spread over {newRemainingDays} days)
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Actions Button Footers */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => setIsExtendViewOpen(false)}
            className="flex-1 py-4 border border-outline-variant text-on-surface-variant hover:bg-input rounded-full text-xs font-semibold cursor-pointer active:scale-95 duration-100 flex items-center justify-center gap-1.5 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmExtension}
            className="flex-[2] py-4 rounded-full bg-btn-gradient text-white hover:brightness-110 font-bold text-xs active:scale-95 duration-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer order-1 sm:order-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Confirm Term Extension</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-28">
      {/* Top App bar */}
      <header className="flex justify-between items-center bg-transparent py-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 cursor-pointer flex items-center justify-center active:scale-95 text-on-surface hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold font-display text-on-surface leading-tight">
              {loanee.name}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-success shadow-sm" />
              <span className="text-[10px] font-bold font-mono text-success dark:text-success uppercase tracking-wider">
                Active Ledger
              </span>
            </div>
          </div>
        </div>

        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-on-surface">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Grid summarizing Loan principal variables & metrics */}
      <section className="grid grid-cols-2 gap-4">
        {/* Balance Card: Screen 7 details */}
        <div className="col-span-2 p-5 btn-hero text-white rounded-2xl shadow-md space-y-4 relative overflow-hidden">
          {/* subtle background mesh decoration */}
          <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

          <div className="flex justify-between items-start">
            <div className="space-y-1 z-10">
              <p className="text-[10px] font-bold tracking-wider text-primary-dim uppercase font-mono">
                Outstanding Balance
              </p>
              <h2 className="text-2xl font-extrabold font-display leading-none">
                {formatCurrency(outstanding)}
              </h2>
              {/* Overpaid alert message matching ravi kumar's spec */}
              <p className="text-[10px] text-success font-bold font-mono tracking-wide flex items-center gap-0.5">
                <span>▲ ₹200 overpaid credit buffer available</span>
              </p>
            </div>
            
            <div className="bg-white/10 p-2.5 rounded-xl text-white">
              <Wallet className="w-6 h-6 stroke-[1.5]" />
            </div>
          </div>

          <div className="space-y-1.5 z-10 relative">
            <div className="flex justify-between text-[10px] font-semibold text-primary-dim font-mono">
              <span>Progress: {daysPassed} of {activeLoan.durationDays} days</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-success glow-green rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Small variable cells */}
        <div className="p-4 bg-card rounded-2xl border border-subtle shadow-sm flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase font-mono">
            Principal
          </p>
          <p className="text-base font-bold font-display text-primary dark:text-primary-dim">
            {formatCurrency(totalPrincipal)}
          </p>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-subtle shadow-sm flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase font-mono">
            Daily Expected
          </p>
          <p className="text-base font-bold font-display text-primary dark:text-primary-dim">
            {formatCurrency(expectedInstallment)}
          </p>
        </div>
      </section>

      {/* Filter Chips Bar */}
      <section className="no-scrollbar overflow-x-auto flex gap-2">
        {(['All', 'Paid', 'Unpaid', 'Partial'] as const).map(type => {
          const isActive = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold cursor-pointer font-sans transition-all duration-150 py-2 ${
                isActive
                  ? 'bg-primary dark:bg-primary-container text-white shadow-sm'
                  : 'bg-card/50 text-on-surface-variant border border-subtle hover:bg-input'
              }`}
            >
              {type}
            </button>
          );
        })}
      </section>

      {/* Payment Ledger Sheet section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold font-display text-on-surface">
            Daily Ledger
          </h3>
          <p className="text-[10px] font-semibold text-on-surface-variant italic font-mono flex items-center gap-1 opacity-80">
            <span>Tap row for custom entry</span>
          </p>
        </div>

        {/* Pinned Today element */}
        {todayPayment && (
          <div className="p-4 bg-card border-2 border-primary-container/40 dark:border-primary-container/70 rounded-2xl shadow-sm block space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-primary dark:text-primary-dim uppercase font-mono">
                  Today
                </p>
                <h4 className="text-base font-bold font-display text-on-surface">
                  {new Date(todayPayment.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase font-mono">
                  Expected
                </span>
                <p className="text-base font-bold font-display text-on-surface font-mono">
                  {formatCurrency(todayPayment.expected)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleTodayStatChange('Paid')}
                className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer ${
                  todayPayment.status === 'Paid'
                    ? 'bg-success text-white'
                    : 'border border-outline-variant/50 text-on-surface-variant hover:bg-success/10 dark:hover:bg-success/15 hover:text-success'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Paid</span>
              </button>
              
              <button
                onClick={() => handleTodayStatChange('Unpaid')}
                className={`flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer ${
                  todayPayment.status === 'Unpaid'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'border border-outline-variant/50 text-on-surface-variant hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Unpaid</span>
              </button>
            </div>
          </div>
        )}

        {/* Historical grid rows list */}
        <div className="bg-nav divide-y divide-outline-variant/20 dark:divide-outline/10 border border-subtle rounded-2xl overflow-hidden shadow-sm">
          {filteredPastPayments.map(p => {
            return (
              <button
                key={p.id}
                onClick={() => handlePastRowClick(p)}
                className="w-full flex items-center justify-between p-4 hover-row transition-colors text-left group cursor-pointer"
              >
                <div>
                  <p className="font-bold text-sm text-on-surface font-display leading-tight">
                    {new Date(p.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                  <p className="text-[10px] font-semibold text-on-surface-variant font-mono mt-0.5">
                    Exp: {formatCurrency(p.expected)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 font-mono">
                  {p.status === 'Paid' ? (
                    <div className="px-2 py-0.5 text-success dark:text-success text-[10px] font-bold font-mono rounded-full bg-success/10 dark:bg-success/15 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />
                      <span>PAID</span>
                    </div>
                  ) : p.status === 'Partial' ? (
                    <div className="px-2 py-0.5 text-warning text-[10px] font-bold font-mono rounded-full bg-amber-50 dark:bg-warning/10 flex items-center gap-1">
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>PARTIAL</span>
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 text-rose-600 text-[10px] font-bold font-mono rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>UNPAID</span>
                    </div>
                  )}

                  <p className={`text-xs font-bold font-mono ${p.status === 'Paid' ? 'text-success dark:text-success' : p.status === 'Partial' ? 'text-warning' : 'text-on-surface-variant'}`}>
                    {p.status === 'Partial' 
                      ? `${formatCurrency(p.paidAmount)} of ${formatCurrency(p.expected)}`
                      : formatCurrency(p.paidAmount)
                    }
                  </p>
                </div>
              </button>
            );
          })}

          {filteredPastPayments.length === 0 && (
            <div className="p-8 text-center text-xs text-on-surface-variant font-medium">
              No daily ledger entries match this type filter.
            </div>
          )}
        </div>
      </section>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-header/95 backdrop-blur-md border-t border-outline-variant/30 p-4 pb-safe flex gap-3 z-30 justify-around">
        <button
          onClick={() => setIsExtendViewOpen(true)}
          className="flex-1 h-12 bg-btn-gradient hover:brightness-105 active:scale-95 text-white font-semibold font-display text-xs rounded-full cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary/15"
        >
          <RotateCcw className="w-4 h-4 rotate-180" />
          <span>Extend Loan Term</span>
        </button>
        <button
          onClick={() => setIsCloseModalOpen(true)}
          className="flex-none h-12 px-6 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-error font-semibold font-display text-xs rounded-full active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
        >
          Close Loan
        </button>
      </div>

      {/* Bottom Sheet - CUSTOM KEYPAD OVERLAY SHEET - SCREEN 7 DETAILS */}
      {selectedPaymentForEdit && (
        <>
          {/* Dimmed backdrop scrim */}
          <div 
            onClick={() => setSelectedPaymentForEdit(null)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto" 
          />
          
          <div className="fixed bottom-0 left-0 w-full bg-card rounded-t-3xl z-50 p-6 shadow-2xl border-t border-outline-variant/30 max-h-[90vh] overflow-y-auto max-w-md mx-auto right-0">
            <div className="w-12 h-1 bg-gray-200 dark:bg-outline-variant/50 rounded-full mx-auto mb-5" />
            
            <h3 className="font-bold text-lg font-display text-on-surface">
              Enter Custom Amount
            </h3>
            <p className="text-on-surface-variant text-xs mt-0.5">
              For payment on{' '}
              <span className="font-bold underline">
                {new Date(selectedPaymentForEdit.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </p>

            <div className="space-y-4 mt-6">
              {/* Main big visual amount input */}
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-xl font-bold text-primary dark:text-primary-dim">
                  ₹
                </span>
                <input
                  type="text"
                  readOnly
                  value={customAmountInput}
                  onChange={e => setCustomAmountInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 bg-input-low border-2 border-primary-container/40 dark:border-primary-container/70 rounded-xl text-xl font-bold text-on-surface focus:outline-none placeholder:text-on-surface-variant font-mono text-center select-all"
                  placeholder="0.00"
                />
              </div>

              {/* Action row */}
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => setSelectedPaymentForEdit(null)}
                  className="h-12 border border-outline-variant/50 dark:border-outline/20 text-on-surface-variant rounded-full font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomAmount}
                  className="h-12 bg-btn-gradient text-white rounded-full font-semibold text-xs active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Save Amount
                </button>
              </div>
            </div>

            {/* Numeric Keypad Visualization - Fully Interactive in AI Studio! */}
            <div className="grid grid-cols-3 gap-2 mt-6 select-none bg-input/50 p-4 rounded-2xl border border-subtle">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(num => (
                <button
                  key={num}
                  onClick={() => appendNumber(num)}
                  className="h-12 flex items-center justify-center font-bold text-lg font-mono text-on-surface hover:bg-input rounded-xl cursor-pointer active:scale-95 transition-transform"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={deleteLastDigit}
                className="h-12 flex items-center justify-center font-bold text-lg text-rose-500 hover:bg-input rounded-xl cursor-pointer active:scale-95 transition-transform"
              >
                ⌫
              </button>
            </div>
          </div>
        </>
      )}

      {/* Screen 3 warning confirmation modal triggers overlay */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Dimmed backdrop */}
          <div 
            onClick={() => setIsCloseModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" 
          />

          {/* Modal Container */}
          <div className="relative bg-card border border-outline-variant/40 dark:border-outline/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              {/* Alert symbol */}
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-error-container/20 flex items-center justify-center mb-1 shadow-lg shadow-rose-500/10">
                <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-400 stroke-[2]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-bold font-display text-on-surface">
                  Confirm Closure
                </h2>
                <p className="text-xs text-on-surface-variant font-medium">
                  {formatCurrency(outstanding)} still outstanding. Close anyway?
                </p>
              </div>

              {/* Balance card */}
              <div className="bg-input-low border border-outline-variant/35 rounded-xl p-4 w-full">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                  Current Outstanding
                </p>
                <div className="flex items-center justify-center gap-1 mt-1 text-rose-600 font-extrabold text-2xl font-mono">
                  {formatCurrency(outstanding)}
                </div>
              </div>

              {/* Note caution warning info */}
              <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-tertiary-container/10 border border-amber-200 dark:border-tertiary/20 rounded-xl text-left">
                <Info className="w-10 h-10 text-warning shrink-0 select-none stroke-[1.5]" />
                <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 leading-normal">
                  Closing this loan will mark the remaining balance as a loss in your ledger. This action is permanent. No further collection records can be booked.
                </p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-input-low flex flex-col gap-2 border-t border-outline-variant/20">
              <button
                onClick={handleConfirmClose}
                className="w-full h-12 flex items-center justify-center rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Close loan
              </button>
              
              <button
                onClick={() => setIsCloseModalOpen(false)}
                className="w-full h-12 flex items-center justify-center rounded-full border-2 border-outline-variant/50 text-on-surface-variant text-xs font-semibold hover:bg-gray-200/50 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
