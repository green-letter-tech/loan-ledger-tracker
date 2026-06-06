import { Loanee, Loan, Payment, AppSettings } from '../types';

// Helper to generate sequential dates backwards from today
function getPastDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const TODAY_STR = getPastDateString(0);

// Helper to generate payments list for Ravi Kumar's first loan (50 days)
// Today is day 32 (index 31). Days 1-31 are generated.
function generateRaviPayments(): Payment[] {
  const payments: Payment[] = [];
  // Ravi Kumar Loan 1: 50 days, daily expected ₹300. 
  // Let's generate historical payments up to Day 32 (today)
  for (let i = 0; i < 32; i++) {
    const dateStr = getPastDateString(31 - i); // 31 days ago to today
    let status: 'Paid' | 'Unpaid' | 'Partial' = 'Paid';
    let paidAmount = 300;

    // Today is "2026-05-25" (daysAgo = 0, index i = 31) -> un-acted by default
    if (i === 31) {
      status = 'Unpaid';
      paidAmount = 0;
    } else if (i === 30) {
      // 24 Mayyesterday -> Paid
      status = 'Paid';
      paidAmount = 300;
    } else if (i === 29) {
      // 23 May -> Partial
      status = 'Partial';
      paidAmount = 150;
    } else if (i === 28) {
      // 22 May -> Unpaid
      status = 'Unpaid';
      paidAmount = 0;
    } else if (i === 27) {
      // 21 May -> Paid
      status = 'Paid';
      paidAmount = 300;
    } else {
      // randomly mostly Paid to keep outstanding correct
      const rand = Math.random();
      if (rand < 0.08) {
        status = 'Unpaid';
        paidAmount = 0;
      } else if (rand < 0.15) {
        status = 'Partial';
        paidAmount = 150;
      }
    }

    payments.push({
      id: `p-ravi-1-${i}`,
      date: dateStr,
      expected: 300,
      paidAmount,
      status,
    });
  }
  return payments;
}

// Generate payment records for standard loans quickly
function generateGenericPayments(count: number, dailyExpected: number, paidProb = 0.8): Payment[] {
  const payments: Payment[] = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let status: 'Paid' | 'Unpaid' | 'Partial' = 'Paid';
    let paidAmount = dailyExpected;

    if (rand > paidProb) {
      status = 'Unpaid';
      paidAmount = 0;
    } else if (rand > paidProb - 0.1) {
      status = 'Partial';
      paidAmount = Math.floor(dailyExpected / 2);
    }

    payments.push({
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      date: getPastDateString(count - i),
      expected: dailyExpected,
      paidAmount,
      status,
    });
  }
  return payments;
}

export const INITIAL_LOANEES: Loanee[] = [
  {
    id: 'l-ravi',
    name: 'Ravi Kumar',
    phone: '+91 98765 43210',
    avatarColor: 'bg-primary',
    loans: [
      {
        id: 'ln-ravi-1',
        loaneeId: 'l-ravi',
        principal: 10000,
        dailyExpected: 300,
        startDate: getPastDateString(31),
        durationDays: 50,
        status: 'Active',
        payments: generateRaviPayments(),
      },
      {
        id: 'ln-ravi-2',
        loaneeId: 'l-ravi',
        principal: 40000,
        dailyExpected: 900,
        startDate: getPastDateString(10),
        durationDays: 60,
        status: 'Active',
        payments: generateGenericPayments(10, 900, 0.90), // outstanding will align roughly to ₹39,600, total ~ ₹45,000 combined outstanding
      }
    ]
  },
  {
    id: 'l-priya',
    name: 'Priya Sharma',
    phone: '+91 98888 12345',
    avatarColor: 'bg-success',
    loans: [
      {
        id: 'ln-priya-1',
        loaneeId: 'l-priya',
        principal: 15000,
        dailyExpected: 400,
        startDate: getPastDateString(12),
        durationDays: 45,
        status: 'Active',
        payments: generateGenericPayments(12, 400, 0.85), // roughly 12,000 outstanding (matches visual list)
      }
    ]
  },
  {
    id: 'l-ankit-s',
    name: 'Ankit Singh',
    phone: '+91 70001 22334',
    avatarColor: 'bg-primary',
    loans: [
      {
        id: 'ln-ankits-1',
        loaneeId: 'l-ankit-s',
        principal: 50000,
        dailyExpected: 1500,
        startDate: getPastDateString(20),
        durationDays: 40,
        status: 'Active',
        payments: generateGenericPayments(20, 1500, 0.70),
      },
      {
        id: 'ln-ankits-2',
        loaneeId: 'l-ankit-s',
        principal: 30000,
        dailyExpected: 800,
        startDate: getPastDateString(15),
        durationDays: 40,
        status: 'Active',
        payments: generateGenericPayments(15, 800, 0.75),
      },
      {
        id: 'ln-ankits-3',
        loaneeId: 'l-ankit-s',
        principal: 20000,
        dailyExpected: 500,
        startDate: getPastDateString(8),
        durationDays: 30,
        status: 'Active',
        payments: generateGenericPayments(8, 500, 0.80),
      },
      {
        id: 'ln-ankits-4',
        loaneeId: 'l-ankit-s',
        principal: 12000,
        dailyExpected: 400,
        startDate: getPastDateString(5),
        durationDays: 30,
        status: 'Active',
        payments: generateGenericPayments(5, 400, 0.90),
      }
    ] // combined aggregate of ~ ₹1,12,000 outstanding matching the mockup
  },
  {
    id: 'l-meera',
    name: 'Meera Reddy',
    phone: '+91 99000 88776',
    avatarColor: 'bg-warning',
    loans: [
      {
        id: 'ln-meera-1',
        loaneeId: 'l-meera',
        principal: 8000,
        dailyExpected: 250,
        startDate: getPastDateString(14),
        durationDays: 35,
        status: 'Active',
        payments: generateGenericPayments(14, 250, 0.70), // roughly ₹5,000 outstanding (matches mockup)
      }
    ]
  },
  {
    id: 'l-ankit-v',
    name: 'Ankit Verma',
    phone: '+91 92233 44556',
    avatarColor: 'bg-warning',
    loans: [
      {
        id: 'ln-ankitv-1',
        loaneeId: 'l-ankit-v',
        principal: 15000,
        dailyExpected: 500,
        startDate: getPastDateString(9),
        durationDays: 30,
        status: 'Active',
        payments: generateGenericPayments(9, 500, 0.70), // roughly ₹10,500 outstanding (matches screen 5)
      }
    ]
  },
  {
    id: 'l-vikram',
    name: 'Vikram Seth',
    phone: '+91 91234 56789',
    avatarColor: 'bg-primary-dim',
    loans: [
      {
        id: 'ln-vikram-1',
        loaneeId: 'l-vikram',
        principal: 60000,
        dailyExpected: 1200,
        startDate: getPastDateString(25),
        durationDays: 50,
        status: 'Active',
        payments: generateGenericPayments(25, 1200, 0.65),
      },
      {
        id: 'ln-vikram-2',
        loaneeId: 'l-vikram',
        principal: 50000,
        dailyExpected: 1000,
        startDate: getPastDateString(18),
        durationDays: 50,
        status: 'Active',
        payments: generateGenericPayments(18, 1000, 0.70),
      },
      {
        id: 'ln-vikram-3',
        loaneeId: 'l-vikram',
        principal: 20000,
        dailyExpected: 600,
        startDate: getPastDateString(5),
        durationDays: 30,
        status: 'Active',
        payments: generateGenericPayments(5, 600, 0.85),
      }
    ] // combined average of ₹1,10,000 outstanding, matching screen 4
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  reminders: {
    enabled: true,
    frequency: 'Once daily',
    times: ['7:00 PM', '9:00 AM']
  }
};

// LocalStorage Utilities
export function getStoredLoanees(): Loanee[] {
  const data = localStorage.getItem('lendledger_loanees');
  if (!data) {
    localStorage.setItem('lendledger_loanees', JSON.stringify(INITIAL_LOANEES));
    return INITIAL_LOANEES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_LOANEES;
  }
}

export function saveStoredLoanees(loanees: Loanee[]) {
  localStorage.setItem('lendledger_loanees', JSON.stringify(loanees));
}

export function getStoredSettings(): AppSettings {
  const data = localStorage.getItem('lendledger_settings');
  if (!data) {
    localStorage.setItem('lendledger_settings', JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings) {
  localStorage.setItem('lendledger_settings', JSON.stringify(settings));
}

// Financial Math Helpers
export function getLoanOutstanding(loan: Loan): number {
  if (loan.status === 'Closed') {
    return 0;
  }
  const totalPrincipal = loan.principal;
  // Outstanding is actually total potential value (expectedContractValue or dailyExpected * durationDays) minus paidAmount so far
  const totalExpectedValue = loan.expectedContractValue !== undefined 
    ? loan.expectedContractValue 
    : loan.dailyExpected * loan.durationDays;
  const totalPaid = loan.payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const outstanding = Math.max(0, totalExpectedValue - totalPaid);
  return outstanding;
}

export function getLoaneeTotalOutstanding(loanee: Loanee): number {
  return loanee.loans.reduce((sum, loan) => sum + getLoanOutstanding(loan), 0);
}

export function getGlobalStats(loanees: Loanee[]) {
  let totalLoaned = 0; // Total Sum of principals of active loans
  let totalReceived = 0; // Total received so far from active loans
  let totalOutstanding = 0; // Combined active loan outstanding balances
  let activeLoansCount = 0;

  loanees.forEach(loanee => {
    loanee.loans.forEach(loan => {
      if (loan.status === 'Active') {
        totalLoaned += loan.principal;
        const paidThisLoan = loan.payments.reduce((sum, p) => sum + p.paidAmount, 0);
        totalReceived += paidThisLoan;
        totalOutstanding += getLoanOutstanding(loan);
        activeLoansCount++;
      }
    });
  });

  return {
    totalLoaned,
    totalReceived,
    totalOutstanding,
    activeLoansCount
  };
}

// Format number in Indian numbering system with commas: e.g. 2,84,500
export function formatCurrency(num: number): string {
  // We'll return Indian formatted Rupee value
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(num);
}
