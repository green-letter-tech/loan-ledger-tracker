import type { LoanStatus } from '@lendledger/core';

import type { LoanStatusLabel } from '../components/ui/StatusPill';

export function loanStatusToPill(status: LoanStatus): LoanStatusLabel {
  switch (status) {
    case 'active':
    case 'extended':
      return 'Active';
    case 'closed':
      return 'Closed';
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled loan status: ${_exhaustive}`);
    }
  }
}
