import React, { useState } from 'react';
import { AppSettings, ReminderSetting } from '../types';
import { 
  Bell, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  X, 
  Wallet, 
  Coins 
} from 'lucide-react';

interface OnboardingFlowProps {
  onOnboardingComplete: (appSettings: AppSettings) => void;
  currentSettings: AppSettings;
}

export default function OnboardingFlow({
  onOnboardingComplete,
  currentSettings,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Setup reminder states
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [remindersTimes, setRemindersTimes] = useState<string[]>(['7:00 PM', '9:00 AM']);
  const [newTimeInput, setNewTimeInput] = useState('');
  const [isAddingTime, setIsAddingTime] = useState(false);

  // Time utilities matching SettingsTab AM/PM conversion
  const handleAddTime = () => {
    if (!newTimeInput) return;
    
    let [hoursStr, minutesStr] = newTimeInput.split(':');
    let hours = parseInt(hoursStr);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const formatted = `${hours}:${minutesStr} ${suffix}`;

    if (remindersTimes.includes(formatted)) {
      alert('This alert time already exists!');
      return;
    }

    setRemindersTimes(prev => [...prev, formatted]);
    setNewTimeInput('');
    setIsAddingTime(false);
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setRemindersTimes(prev => prev.filter(t => t !== timeToRemove));
  };

  const handleFinish = () => {
    const updatedSettings: AppSettings = {
      ...currentSettings,
      reminders: {
        enabled: remindersEnabled,
        frequency: 'Once daily',
        times: remindersTimes
      }
    };
    onOnboardingComplete(updatedSettings);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-app text-on-surface dark:text-on-surface p-6 relative overflow-hidden transition-colors">
      {/* Decorative ambient atmospheric background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 dark:bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-72 h-72 bg-success/5 dark:bg-success/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto bg-card/90 backdrop-blur-xl rounded-3xl border border-subtle p-6 md:p-8 shadow-2xl relative z-10 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Progress indicator steps dots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-primary dark:bg-primary-dim' : 'w-2 bg-gray-200 dark:bg-outline-variant/30'}`} />
            <span className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-primary dark:bg-primary-dim' : 'w-2 bg-gray-200 dark:bg-outline-variant/30'}`} />
          </div>
          <span className="text-[10px] font-bold font-mono text-on-surface-variant uppercase tracking-wider">
            Step {step} of 2
          </span>
        </div>

        {step === 1 ? (
          /* SCREEN 1: WELCOME SCREEN */
          <div className="space-y-6 flex flex-col items-center text-center">
            
            {/* Glowing LL Monogram Logo */}
            <div className="relative group select-none py-2">
              <div className="absolute -inset-2 btn-gradient rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
              <div className="relative w-20 h-20 btn-gradient text-white font-black text-3xl font-display flex items-center justify-center rounded-2xl border border-primary/20 shadow-lg">
                LL
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-on-surface tracking-tight">
                Welcome to LendLedger
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-1">
                Your professional, self-hosted offline credit ledger.
              </p>
            </div>

            {/* List of benefit badges */}
            <div className="w-full space-y-3.5 pt-2 text-left">
              
              <div className="flex items-start gap-3 bg-input/50 p-3 rounded-2xl border border-subtle">
                <div className="p-2.5 bg-primary/10 dark:bg-primary/15 rounded-xl text-primary dark:text-primary-dim shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface font-display leading-tight">
                    Micro-Term Calculation
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    Structure custom daily payout rates & compound terms securely.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-input/50 p-3 rounded-2xl border border-subtle">
                <div className="p-2.5 bg-success/10 dark:bg-success/15 rounded-xl text-success dark:text-success shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface font-display leading-tight">
                    Smart Reminders Alert
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    Define custom daily notifications to stay ahead of outstanding loans.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-input/50 p-3 rounded-2xl border border-subtle">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface font-display leading-tight">
                    100% Offline confidentiality
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    All ledger transactions are stored inside your browser sandbox device.
                  </p>
                </div>
              </div>

            </div>

            {/* Click Handler slider button */}
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-full bg-btn-gradient text-white font-semibold text-xs active:scale-95 duration-100 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 cursor-pointer"
            >
              <span>Set Up Quick Reminders</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

          </div>
        ) : (
          /* SCREEN 2: REMINDER SETUP TIME PICKERS */
          <div className="space-y-6">
            
            <div className="text-center space-y-1">
              <h2 className="text-xl md:text-2xl font-bold font-display text-on-surface tracking-tight">
                Configure Reminders
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Receive proactive prompt notifications to audit customer accounts.
              </p>
            </div>

            {/* Reminder Custom Interactive Block Card config panel */}
            <div className="bg-input rounded-2xl border border-outline-variant/30 p-4 space-y-4 shadow-sm">
              
              {/* Toggle switch */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs font-display text-on-surface">
                  Overdue Accounts Alerts
                </span>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remindersEnabled}
                    onChange={e => setRemindersEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary-container" />
                </label>
              </div>

              {remindersEnabled && (
                <div className="space-y-3.5 pt-2 border-t border-outline-variant/20 animate-in fade-in duration-200">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase font-mono tracking-wide">
                    Notification Times List
                  </p>

                  <div className="flex flex-col gap-2">
                    {remindersTimes.map(time => (
                      <div
                        key={time}
                        className="flex items-center justify-between bg-cardest p-3 rounded-xl border border-subtle text-on-surface font-mono"
                      >
                        <span className="font-bold text-xs tracking-wide">{time}</span>
                        <button
                          onClick={() => handleRemoveTime(time)}
                          className="text-error hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-full transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Quick Adding element */}
                    {isAddingTime ? (
                      <div className="bg-card p-3 rounded-xl border border-outline-variant/40 space-y-3">
                        <input
                          type="time"
                          value={newTimeInput}
                          onChange={e => setNewTimeInput(e.target.value)}
                          className="w-full text-center p-2 bg-input-low border border-outline-variant/40 rounded-lg text-xs text-on-surface outline-none font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingTime(false)}
                            className="py-1 text-[10px] uppercase font-bold border border-outline-variant rounded-lg text-on-surface-variant cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddTime}
                            className="py-1 text-[10px] bg-primary text-white rounded-lg cursor-pointer font-bold uppercase tracking-wider"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingTime(true)}
                        className="text-[10px] flex items-center justify-center gap-1 py-2 bg-input text-primary font-bold rounded-lg cursor-pointer transition-colors hover:bg-primary/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Alert Time Slot</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Back & Submit Row actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 border border-outline-variant/50 text-on-surface-variant rounded-full text-xs font-semibold cursor-pointer active:scale-95 duration-100 flex items-center justify-center gap-1"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] py-4 rounded-full bg-btn-gradient text-white font-semibold text-xs active:scale-95 duration-100 flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Get Started</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
