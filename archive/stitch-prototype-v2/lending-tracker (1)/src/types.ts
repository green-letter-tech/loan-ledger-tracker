export interface Payment {
  id: string;
  date: string; // YYYY-MM-DD
  expected: number;
  paidAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
}

export interface Loan {
  id: string;
  loaneeId: string;
  principal: number;
  dailyExpected: number;
  startDate: string; // YYYY-MM-DD
  durationDays: number;
  status: 'Active' | 'Closed' | 'Overpaid';
  payments: Payment[];
  expectedContractValue?: number;
}

export interface Loanee {
  id: string;
  name: string;
  phone: string;
  avatarColor: string; // tailwind class suffix, e.g. 'blue', 'green', etc.
  loans: Loan[];
}

export interface ReminderSetting {
  enabled: boolean;
  frequency: string;
  times: string[]; // ['19:00', '09:00']
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  reminders: ReminderSetting;
}
