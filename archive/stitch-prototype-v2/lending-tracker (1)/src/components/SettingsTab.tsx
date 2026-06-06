import React, { useState } from 'react';
import { AppSettings, ReminderSetting } from '../types';
import { Bell, ShieldCheck, ChevronRight, Check, Plus, Minus, Info, Moon, Sun, Smartphone, X } from 'lucide-react';

interface SettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export default function SettingsTab({
  settings,
  onUpdateSettings,
}: SettingsTabProps) {
  const [newTimeInput, setNewTimeInput] = useState('');
  const [isAddingTime, setIsAddingTime] = useState(false);

  // Updates Theme mode
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onUpdateSettings({
      ...settings,
      theme,
    });
  };

  // Updates remind toggler
  const handleToggleReminders = (enabled: boolean) => {
    onUpdateSettings({
      ...settings,
      reminders: {
        ...settings.reminders,
        enabled,
      },
    });
  };

  // Add notification time
  const handleAddTime = () => {
    if (!newTimeInput) return;
    
    // Convert 24h to standard AM/PM for mockup fidelity
    let [hoursStr, minutesStr] = newTimeInput.split(':');
    let hours = parseInt(hoursStr);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const formatted = `${hours}:${minutesStr} ${suffix}`;

    if (settings.reminders.times.includes(formatted)) {
      alert('This alert time already exists!');
      return;
    }

    const updatedTimes = [...settings.reminders.times, formatted];
    onUpdateSettings({
      ...settings,
      reminders: {
        ...settings.reminders,
        times: updatedTimes,
      },
    });
    setNewTimeInput('');
    setIsAddingTime(false);
  };

  // Clear notification time
  const handleRemoveTime = (time: string) => {
    const updatedTimes = settings.reminders.times.filter(t => t !== time);
    onUpdateSettings({
      ...settings,
      reminders: {
        ...settings.reminders,
        times: updatedTimes,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-xl font-bold font-display text-on-surface">
          Settings
        </h2>
        <p className="text-xs text-on-surface-variant font-medium mt-1">
          Customize notifications frequency, color layouts, and platform variables.
        </p>
      </div>

      <main className="space-y-6 max-w-md mx-auto">
        {/* APPEARANCE SECTION */}
        <section className="space-y-2">
          <h2 className="text-on-surface-variant font-bold text-[10px] tracking-widest uppercase font-mono px-1">
            APPEARANCE
          </h2>
          <div className="bg-card rounded-2xl border border-subtle overflow-hidden shadow-sm">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">
                  Theme
                </span>
                <span className="text-[10px] font-mono text-on-surface-variant font-bold bg-input px-2 py-0.5 rounded uppercase">
                  {settings.theme}
                </span>
              </div>
              
              {/* Segmented Control */}
              <div className="bg-input p-1 rounded-xl flex items-center gap-1">
                {(['light', 'dark', 'system'] as const).map(mode => {
                  const isActive = settings.theme === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleThemeChange(mode)}
                      className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg capitalize cursor-pointer transition-all ${
                        isActive
                          ? 'bg-card text-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* REMINDERS SECTION */}
        <section className="space-y-2">
          <h2 className="text-on-surface-variant font-bold text-[10px] tracking-widest uppercase font-mono px-1">
            REMINDERS
          </h2>
          <div className="bg-card rounded-2xl border border-subtle overflow-hidden shadow-sm">
            {/* Toggle Row */}
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 dark:bg-primary/15 rounded-lg text-primary dark:text-primary-dim">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-on-surface">
                  Enable reminders
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminders.enabled}
                  onChange={e => handleToggleReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary-container" />
              </label>
            </div>

            {/* Dropdown Row */}
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 active:bg-input transition-colors">
              <span className="font-semibold text-sm text-on-surface">
                Frequency
              </span>
              <div className="flex items-center gap-1.5 text-primary dark:text-primary-dim font-bold text-xs font-mono">
                <span>Once daily</span>
              </div>
            </div>

            {/* Sub-section Notification Times */}
            <div className="bg-input/50 p-4 space-y-3">
              <p className="text-on-surface-variant font-bold text-[10px] uppercase font-mono tracking-wide">
                Notification times
              </p>
              
              <div className="flex flex-col gap-2">
                {settings.reminders.times.map(time => (
                  <div
                    key={time}
                    className="flex items-center justify-between bg-cardest p-3 rounded-xl border border-subtle text-on-surface font-mono"
                  >
                    <span className="font-bold text-sm tracking-wide">{time}</span>
                    <button
                      onClick={() => handleRemoveTime(time)}
                      className="text-error hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Time triggering button */}
                {isAddingTime ? (
                  <div className="bg-card p-3 rounded-xl border border-outline-variant/40 space-y-3">
                    <input
                      type="time"
                      value={newTimeInput}
                      onChange={e => setNewTimeInput(e.target.value)}
                      className="w-full text-center p-2 bg-input-low border border-outline-variant/40 rounded-lg text-sm text-on-surface outline-none font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsAddingTime(false)}
                        className="py-1 text-xs border border-outline-variant rounded-lg text-on-surface-variant cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddTime}
                        className="py-1 text-xs bg-primary text-white rounded-lg cursor-pointer font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTime(true)}
                    className="mt-2 text-xs flex items-center justify-center gap-1.5 py-3.5 bg-btn-gradient text-white font-semibold rounded-full shadow-lg shadow-primary/15 cursor-pointer active:scale-95 duration-100"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add notification time</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="space-y-2">
          <h2 className="text-on-surface-variant font-bold text-[10px] tracking-widest uppercase font-mono px-1">
            ABOUT
          </h2>
          <div className="bg-card rounded-2xl border border-subtle overflow-hidden shadow-sm font-sans">
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
              <span className="font-semibold text-sm text-on-surface">
                App version
              </span>
              <span className="text-on-surface-variant font-mono font-bold text-xs">
                1.0.0
              </span>
            </div>
            <a
              href="#privacy"
              onClick={e => { e.preventDefault(); alert('LeadLedger stores 100% of its data locally inside your sandboxed device browser session. Your metrics never hit cloud servers, keeping your customer data confidential.'); }}
              className="p-4 flex items-center justify-between hover-row transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 dark:bg-success/15 rounded-lg text-success dark:text-success">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-on-surface">
                  Privacy policy
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <p className="text-center pt-4 text-[10px] tracking-wide text-on-surface-variant/75 font-mono italic">
            All data safely stored on this device session
          </p>
        </section>
      </main>
    </div>
  );
}
