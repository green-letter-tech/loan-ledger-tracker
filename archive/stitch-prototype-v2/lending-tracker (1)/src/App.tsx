import React, { useState, useEffect } from 'react';
import { Loanee, Loan, Payment, AppSettings } from './types';
import { 
  getStoredLoanees, 
  saveStoredLoanees, 
  getStoredSettings, 
  saveStoredSettings,
  getGlobalStats,
  formatCurrency
} from './lib/data';
import { applyThemeClass } from './lib/theme';
import HomeDashboard from './components/HomeDashboard';
import CalculatorTab from './components/CalculatorTab';
import LoaneesTab from './components/LoaneesTab';
import LoaneeDetailView from './components/LoaneeDetailView';
import SettingsTab from './components/SettingsTab';
import OnboardingFlow from './components/OnboardingFlow';

// App icons loaded from Lucide for beautiful navigation bars
import { 
  Home, 
  Calculator, 
  Users, 
  Settings, 
  Menu, 
  Plus, 
  UserPlus, 
  X,
  Smartphone,
  Wallet,
  Coins
} from 'lucide-react';

export default function App() {
  // Shared state managers
  const [loanees, setLoanees] = useState<Loanee[]>(() => getStoredLoanees());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => localStorage.getItem('lendledger_onboarded') === 'true');
  const [activeTab, setActiveTab] = useState<'home' | 'calculator' | 'loanees' | 'settings'>('home');
  const [selectedLoaneeId, setSelectedLoaneeId] = useState<string | null>(null);

  const handleOnboardingComplete = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('lendledger_onboarded', 'true');
    setIsOnboarded(true);
  };

  // Quick Customer Profile Creator Modal State
  const [isAddLoaneeOpen, setIsAddLoaneeOpen] = useState(false);
  const [newLoaneeName, setNewLoaneeName] = useState('');
  const [newLoaneePhone, setNewLoaneePhone] = useState('');

  // Synchronize local storage states
  useEffect(() => {
    saveStoredLoanees(loanees);
  }, [loanees]);

  useEffect(() => {
    saveStoredSettings(settings);
    applyThemeClass(settings.theme);
  }, [settings]);

  // Handler: Adds a customer profile from any tab
  const handleAddNewLoanee = (name: string, phone: string): Loanee => {
    const avatarColors = [
      'bg-primary',
      'bg-success',
      'bg-primary',
      'bg-warning',
      'bg-primary-dim',
      'bg-warning',
      'bg-error'
    ];
    const newLoanee: Loanee = {
      id: `l-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      phone: phone.trim(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      loans: []
    };

    setLoanees(prev => [...prev, newLoanee]);
    return newLoanee;
  };

  // Handler: Submits the manual Add Customer pop-up form
  const handleAddLoaneeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoaneeName.trim()) return;
    const added = handleAddNewLoanee(newLoaneeName, newLoaneePhone);
    setIsAddLoaneeOpen(false);
    setNewLoaneeName('');
    setNewLoaneePhone('');
    
    // Deep jump into the loanee's fresh ledger detail sheet
    setSelectedLoaneeId(added.id);
  };

  // Handler: Book a new loan contract (Calculator tab hook)
  const handleCreateLoan = (loaneeId: string, principal: number, dailyExpected: number, durationDays: number, startDate?: string) => {
    // Generate payments backwards for active days or default today's active pending payment
    const payments: Payment[] = [];
    const actualStartDate = startDate || new Date().toISOString().split('T')[0];

    // Build the list of daily expected installments. 
    // To make it look fresh, today is the first payment of the contract.
    payments.push({
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      date: actualStartDate,
      expected: dailyExpected,
      paidAmount: 0,
      status: 'Unpaid'
    });

    const newLoan: Loan = {
      id: `ln-${Math.random().toString(36).substr(2, 9)}`,
      loaneeId,
      principal,
      dailyExpected,
      startDate: actualStartDate,
      durationDays,
      status: 'Active',
      payments
    };

    setLoanees(prev => prev.map(loanee => {
      if (loanee.id === loaneeId) {
        return {
          ...loanee,
          loans: [...loanee.loans, newLoan]
        };
      }
      return loanee;
    }));
  };

  // Handler: Override/update payment list indicators in loanee details
  const handleUpdatePayments = (loaneeId: string, loanId: string, updatedPayments: Payment[]) => {
    setLoanees(prev => prev.map(loanee => {
      if (loanee.id === loaneeId) {
        return {
          ...loanee,
          loans: loanee.loans.map(loan => {
            if (loan.id === loanId) {
              return {
                ...loan,
                payments: updatedPayments
              };
            }
            return loan;
          })
        };
      }
      return loanee;
    }));
  };

  // Handler: Extend contract duration (dynamic added days + layout adjustment mode)
  const handleExtendLoan = (
    loaneeId: string, 
    loanId: string, 
    addedDays: number, 
    mode: 'keep' | 'recalculate'
  ) => {
    setLoanees(prev => prev.map(loanee => {
      if (loanee.id === loaneeId) {
        return {
          ...loanee,
          loans: loanee.loans.map(loan => {
            if (loan.id === loanId) {
              const totalPaid = loan.payments.reduce((sum, p) => sum + p.paidAmount, 0);
              const totalExpectedValue = loan.expectedContractValue !== undefined 
                ? loan.expectedContractValue 
                : loan.dailyExpected * loan.durationDays;
              const outstanding = Math.max(0, totalExpectedValue - totalPaid);

              const paymentsPassed = loan.payments.length;
              const remainingDays = Math.max(1, loan.durationDays - paymentsPassed);
              const newRemainingDays = remainingDays + addedDays;
              const newDurationDays = loan.durationDays + addedDays;

              if (mode === 'recalculate') {
                const newDailyExpected = Math.round(outstanding / newRemainingDays);
                const newExpectedContractValue = totalPaid + (newRemainingDays * newDailyExpected);
                
                // Update active/unpaid payments to reflect new daily expected
                const updatedPayments = loan.payments.map(p => {
                  if (p.status === 'Unpaid') {
                    return { ...p, expected: newDailyExpected };
                  }
                  return p;
                });

                return {
                  ...loan,
                  durationDays: newDurationDays,
                  dailyExpected: newDailyExpected,
                  expectedContractValue: newExpectedContractValue,
                  payments: updatedPayments
                };
              } else {
                // Keep same daily expected
                // Expected contract value increases by addedDays * dailyExpected
                const newExpectedContractValue = totalExpectedValue + (addedDays * loan.dailyExpected);
                return {
                  ...loan,
                  durationDays: newDurationDays,
                  expectedContractValue: newExpectedContractValue
                };
              }
            }
            return loan;
          })
        };
      }
      return loanee;
    }));
  };

  // Handler: Close Active Loan (forced write-off write off loss)
  const handleCloseLoan = (loaneeId: string, loanId: string) => {
    setLoanees(prev => prev.map(loanee => {
      if (loanee.id === loaneeId) {
        return {
          ...loanee,
          loans: loanee.loans.map(loan => {
            if (loan.id === loanId) {
              return {
                ...loan,
                status: 'Closed'
              };
            }
            return loan;
          })
        };
      }
      return loanee;
    }));
  };

  // Finder helper for details drilling
  const activeLoaneeDetailed = selectedLoaneeId 
    ? loanees.find(l => l.id === selectedLoaneeId)
    : null;

  // Global top app bar name & details calculations
  const stats = getGlobalStats(loanees);

  if (!isOnboarded) {
    return (
      <OnboardingFlow
        currentSettings={settings}
        onOnboardingComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-on-surface dark:text-on-surface">
      
      {/* Dynamic Global TopAppBar - Hide on Custom Detail pages to avoid header clash */}
      {!selectedLoaneeId && (
        <header className="w-full top-0 sticky border-b border-outline-variant/30 bg-header/95 backdrop-blur-md z-40 transition-colors">
          <div className="flex justify-between items-center px-4 h-16 max-w-lg mx-auto">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => alert(`LendLedger safe offline DB status: ${loanees.length} customer profiles loaded.`)}
                className="active:scale-95 duration-100 hover:bg-input transition-colors p-2 rounded-full cursor-pointer shrink-0"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>
              
              <div className="flex items-center gap-2 select-none">
                <div id="ll-monogram" className="w-8 h-8 rounded-lg btn-hero shadow-sm flex items-center justify-center text-white font-black text-xs font-display shrink-0">
                  LL
                </div>
                <h1 className="font-bold text-lg font-display tracking-tight text-primary dark:text-on-surface truncate">
                  LendLedger
                </h1>
              </div>
            </div>

            <button 
              onClick={() => setIsAddLoaneeOpen(true)}
              className="active:scale-95 duration-100 hover:bg-input transition-colors p-2 rounded-full cursor-pointer"
            >
              <Plus className="w-5 h-5 text-primary stroke-[2.5]" />
            </button>
          </div>
        </header>
      )}

      {/* Main Applet Content Area */}
      <main className="flex-grow max-w-lg w-full mx-auto px-4 py-4 pb-24 overflow-x-hidden">
        {selectedLoaneeId && activeLoaneeDetailed ? (
          /* Drilled Detailed Ledger Screen */
          <LoaneeDetailView
            loanee={activeLoaneeDetailed}
            onBack={() => setSelectedLoaneeId(null)}
            onUpdatePayments={handleUpdatePayments}
            onExtendLoan={handleExtendLoan}
            onCloseLoan={handleCloseLoan}
          />
        ) : (
          /* Segmented tab screen selection */
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {activeTab === 'home' && (
              <HomeDashboard
                loanees={loanees}
                onNavigate={setActiveTab}
                onSelectLoanee={setSelectedLoaneeId}
                onAddLoaneeClick={() => setIsAddLoaneeOpen(true)}
              />
            )}
            {activeTab === 'calculator' && (
              <CalculatorTab
                loanees={loanees}
                onAddLoanee={handleAddNewLoanee}
                onCreateLoan={handleCreateLoan}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'loanees' && (
              <LoaneesTab
                loanees={loanees}
                onSelectLoanee={setSelectedLoaneeId}
                onAddLoaneeClick={() => setIsAddLoaneeOpen(true)}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onUpdateSettings={setSettings}
              />
            )}
          </div>
        )}
      </main>

      {/* Static Responsive Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-40 rounded-t-2xl bg-nav border-t border-outline-variant/30 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)] transition-all">
        <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2">
          {/* T1: Home */}
          <button
            onClick={() => {
              setSelectedLoaneeId(null);
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'home' && !selectedLoaneeId
                ? 'nav-active px-5 shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Home className="w-5 h-5 fill-current stroke-[1.75]" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1 font-sans">
              Home
            </span>
          </button>

          {/* T2: Calculator */}
          <button
            onClick={() => {
              setSelectedLoaneeId(null);
              setActiveTab('calculator');
            }}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'calculator' && !selectedLoaneeId
                ? 'nav-active px-5 shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Calculator className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1 font-sans">
              Calculator
            </span>
          </button>

          {/* T3: Loanees */}
          <button
            onClick={() => {
              setSelectedLoaneeId(null);
              setActiveTab('loanees');
            }}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all duration-200 cursor-pointer ${
              (activeTab === 'loanees' || selectedLoaneeId)
                ? 'nav-active px-5 shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Users className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1 font-sans">
              Loanees
            </span>
          </button>

          {/* T4: Settings */}
          <button
            onClick={() => {
              setSelectedLoaneeId(null);
              setActiveTab('settings');
            }}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'settings' && !selectedLoaneeId
                ? 'nav-active px-5 shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] uppercase tracking-wider font-bold mt-1 font-sans">
              Settings
            </span>
          </button>
        </div>
      </nav>

      {/* Global Add Customer Dialog Popover Overlay */}
      {isAddLoaneeOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            onClick={() => setIsAddLoaneeOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          />
          
          <form 
            onSubmit={handleAddLoaneeSubmit}
            className="relative bg-card border border-subtle w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 font-sans animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
              <h3 className="font-bold text-base font-display text-on-surface flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-primary" />
                <span>Add New Loanee</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddLoaneeOpen(false)}
                className="text-on-surface-variant hover:bg-input p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-on-surface-variant">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newLoaneeName}
                  onChange={e => setNewLoaneeName(e.target.value)}
                  className="w-full text-sm p-3 bg-input border border-outline-variant/30 rounded-xl outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider font-mono text-on-surface-variant">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 88888"
                  value={newLoaneePhone}
                  onChange={e => setNewLoaneePhone(e.target.value)}
                  className="w-full text-sm p-3 bg-input border border-outline-variant/30 rounded-xl outline-none focus:border-primary text-on-surface font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddLoaneeOpen(false)}
                className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-full text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-btn-gradient text-white rounded-full text-xs font-semibold shadow-lg shadow-primary/15 cursor-pointer hover:brightness-105 active:scale-95 transition-all"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
